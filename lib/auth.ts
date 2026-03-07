import "server-only";
import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto";
import {
  generateRegistrationOptions as generateWebAuthnRegistrationOptions,
  verifyRegistrationResponse as verifyWebAuthnRegistrationResponse,
  generateAuthenticationOptions as generateWebAuthnAuthenticationOptions,
  verifyAuthenticationResponse as verifyWebAuthnAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  GenerateRegistrationOptionsOpts,
  VerifyRegistrationResponseOpts,
  GenerateAuthenticationOptionsOpts,
  VerifyAuthenticationResponseOpts,
} from "@simplewebauthn/server";
import Mailjet from "node-mailjet";
import { sql, type User, type WebAuthnCredential } from "./db";

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const WEBAUTHN_RP_NAME = process.env.WEBAUTHN_RP_NAME || "Rolls";
const WEBAUTHN_RP_ID = process.env.WEBAUTHN_RP_ID || "localhost";
const WEBAUTHN_ORIGIN = process.env.WEBAUTHN_ORIGIN || "http://localhost:3000";
const MAILJET_API_KEY = process.env.MAILJET_API_KEY;
const MAILJET_SECRET_KEY = process.env.MAILJET_SECRET_KEY;
const MAILJET_FROM_EMAIL = process.env.MAILJET_FROM_EMAIL || "noreply@rolls.yannick.computer";
const MAILJET_FROM_NAME = process.env.MAILJET_FROM_NAME || "Rolls";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be set");
}

const jwtSecret = new TextEncoder().encode(JWT_SECRET);

// Mailjet client (lazy initialization)
let mailjetClient: ReturnType<typeof Mailjet.apiConnect> | null = null;
function getMailjetClient() {
  if (!mailjetClient && MAILJET_API_KEY && MAILJET_SECRET_KEY) {
    mailjetClient = Mailjet.apiConnect(MAILJET_API_KEY, MAILJET_SECRET_KEY);
  }
  return mailjetClient;
}

// ============================================================================
// User Lookup
// ============================================================================

export async function lookupUserByIdentifier(identifier: string): Promise<User | null> {
  // Check if identifier is email (contains @) or username
  const isEmail = identifier.includes("@");

  if (isEmail) {
    const [user] = await sql<User[]>`
      SELECT * FROM users WHERE email = ${identifier} LIMIT 1
    `;
    return user || null;
  } else {
    const [user] = await sql<User[]>`
      SELECT * FROM users WHERE username = ${identifier} LIMIT 1
    `;
    return user || null;
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  const [user] = await sql<User[]>`
    SELECT * FROM users WHERE id = ${userId} LIMIT 1
  `;
  return user || null;
}

// ============================================================================
// WebAuthn Functions
// ============================================================================

export async function generateRegistrationOptions(
  email: string,
  username: string
) {
  const user = await sql<User[]>`SELECT * FROM users WHERE email = ${email} LIMIT 1`;

  if (user.length > 0) {
    throw new Error("User already exists");
  }

  const options = await generateWebAuthnRegistrationOptions({
    rpName: WEBAUTHN_RP_NAME,
    rpID: WEBAUTHN_RP_ID,
    userName: email,
    userDisplayName: username,
    userID: new TextEncoder().encode(crypto.randomUUID()),
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });

  return options;
}

export async function verifyRegistrationResponse(
  response: any,
  expectedChallenge: string
) {
  const verification = await verifyWebAuthnRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: WEBAUTHN_ORIGIN,
    expectedRPID: WEBAUTHN_RP_ID,
  });

  return verification;
}

export async function generateAuthenticationOptions(identifier: string) {
  const user = await lookupUserByIdentifier(identifier);

  if (!user) {
    throw new Error("User not found");
  }

  // Get user's credentials
  const credentials = await sql<WebAuthnCredential[]>`
    SELECT * FROM webauthn_credentials WHERE user_id = ${user.id}
  `;

  if (credentials.length === 0) {
    throw new Error("No credentials registered for this user");
  }

  const options = await generateWebAuthnAuthenticationOptions({
    rpID: WEBAUTHN_RP_ID,
    allowCredentials: credentials.map((cred) => ({
      id: cred.credential_id,
      transports: cred.transports as AuthenticatorTransport[] | undefined,
    })),
    userVerification: "preferred",
  });

  return { options, userId: user.id };
}

export async function verifyAuthenticationResponse(
  response: any,
  expectedChallenge: string,
  userId?: string
) {
  const credId = response.id;

  // Look up credential — by user + credential ID if userId known, otherwise by credential ID alone
  const [credential] = userId
    ? await sql<WebAuthnCredential[]>`
        SELECT * FROM webauthn_credentials
        WHERE user_id = ${userId} AND credential_id = ${credId}
        LIMIT 1
      `
    : await sql<WebAuthnCredential[]>`
        SELECT * FROM webauthn_credentials
        WHERE credential_id = ${credId}
        LIMIT 1
      `;

  if (!credential) {
    throw new Error("Credential not found");
  }

  const verification = await verifyWebAuthnAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: WEBAUTHN_ORIGIN,
    expectedRPID: WEBAUTHN_RP_ID,
    credential: {
      id: credential.credential_id,
      publicKey: Buffer.from(credential.public_key, "base64"),
      counter: Number(credential.counter),
      transports: credential.transports as any,
    },
  });

  if (verification.verified) {
    // Update counter
    await sql`
      UPDATE webauthn_credentials
      SET counter = ${verification.authenticationInfo.newCounter},
          last_used_at = NOW()
      WHERE id = ${credential.id}
    `;
  }

  return { ...verification, resolvedUserId: credential.user_id };
}

// ============================================================================
// Session & Cookie Functions
// ============================================================================

export async function createSessionToken(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1y")
    .sign(jwtSecret);

  return token;
}

export async function verifySessionToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret);
    return { userId: payload.userId as string };
  } catch (error) {
    return null;
  }
}

export function makeSessionCookie(token: string, isProduction: boolean = false): string {
  const secure = isProduction ? "Secure; " : "";
  const maxAge = 365 * 24 * 60 * 60; // 1 year in seconds
  return `session=${token}; HttpOnly; ${secure}SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

export function clearSessionCookie(): string {
  return "session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0";
}

// ============================================================================
// API Key Functions
// ============================================================================

export function generateRawApiKey(): string {
  // Generate 32 random bytes and prefix with rk_
  const randomBytes = crypto.randomBytes(32);
  return `rk_${randomBytes.toString("hex")}`;
}

export function hashApiKey(rawKey: string): string {
  // SHA-256 hash
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

export async function verifyApiKey(rawKey: string): Promise<User | null> {
  const keyHash = hashApiKey(rawKey);

  const [apiKey] = await sql<{ user_id: string }[]>`
    SELECT user_id FROM api_keys WHERE key_hash = ${keyHash} LIMIT 1
  `;

  if (!apiKey) {
    return null;
  }

  // Update last_used_at asynchronously
  sql`
    UPDATE api_keys SET last_used_at = NOW() WHERE key_hash = ${keyHash}
  `.catch((err) => console.error("Failed to update API key last_used_at:", err));

  // Get user
  return await getUserById(apiKey.user_id);
}

// ============================================================================
// Email Functions (Mailjet)
// ============================================================================

export async function sendWelcomeEmail(user: User): Promise<void> {
  const client = getMailjetClient();
  if (!client) {
    console.warn("Mailjet not configured, skipping welcome email");
    return;
  }

  try {
    await client.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: MAILJET_FROM_EMAIL,
            Name: MAILJET_FROM_NAME,
          },
          To: [
            {
              Email: user.email,
              Name: user.name || user.username,
            },
          ],
          Subject: "Welcome to Rolls!",
          TextPart: `Hi ${user.username},\n\nWelcome to Rolls! Your account has been created successfully.\n\nTo get started with the CLI, visit your settings page to generate an API key.\n\nEnjoy tracking your film rolls!\n\n— The Rolls Team`,
          HTMLPart: `
            <h2>Welcome to Rolls, ${user.username}!</h2>
            <p>Your account has been created successfully.</p>
            <p>To get started with the CLI, visit your settings page to generate an API key.</p>
            <p>Enjoy tracking your film rolls!</p>
            <p>— The Rolls Team</p>
          `,
        },
      ],
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}

export async function sendInviteEmail(
  to: string,
  inviteCode: string,
  inviterName: string,
  message?: string
): Promise<void> {
  const client = getMailjetClient();
  if (!client) {
    console.warn("Mailjet not configured, skipping invite email");
    return;
  }

  const registrationLink = `${WEBAUTHN_ORIGIN}/register?invite=${inviteCode}`;

  try {
    await client.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: MAILJET_FROM_EMAIL,
            Name: MAILJET_FROM_NAME,
          },
          To: [
            {
              Email: to,
            },
          ],
          Subject: `${inviterName} invited you to join Rolls`,
          TextPart: `${inviterName} has invited you to join Rolls, a film photography roll tracker.\n\n${message || ""}\n\nClick here to register: ${registrationLink}\n\n— The Rolls Team`,
          HTMLPart: `
            <h2>${inviterName} invited you to join Rolls</h2>
            <p>${inviterName} has invited you to join Rolls, a film photography roll tracker.</p>
            ${message ? `<p><em>"${message}"</em></p>` : ""}
            <p><a href="${registrationLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px;">Register Now</a></p>
            <p style="color: #666; font-size: 12px;">Or copy this link: ${registrationLink}</p>
            <p>— The Rolls Team</p>
          `,
        },
      ],
    });
  } catch (error) {
    console.error("Failed to send invite email:", error);
    throw error;
  }
}

export async function sendSecurityNotification(
  user: User,
  event: {
    type: "api_key_created" | "passkey_added" | "passkey_deleted";
    details?: string;
    deviceInfo?: string;
  }
): Promise<void> {
  if (!user.email_notifications) {
    return; // User has disabled notifications
  }

  const client = getMailjetClient();
  if (!client) {
    console.warn("Mailjet not configured, skipping security notification");
    return;
  }

  const eventDescriptions = {
    api_key_created: "A new API key was created",
    passkey_added: "A new passkey was added",
    passkey_deleted: "A passkey was deleted",
  };

  const description = eventDescriptions[event.type];
  const timestamp = new Date().toLocaleString();

  try {
    await client.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: MAILJET_FROM_EMAIL,
            Name: MAILJET_FROM_NAME,
          },
          To: [
            {
              Email: user.email,
              Name: user.name || user.username,
            },
          ],
          Subject: `Security Alert: ${description}`,
          TextPart: `Hi ${user.username},\n\n${description} on your Rolls account.\n\nTime: ${timestamp}\n${event.details ? `Details: ${event.details}\n` : ""}${event.deviceInfo ? `Device: ${event.deviceInfo}\n` : ""}\nIf this wasn't you, please secure your account immediately.\n\n— The Rolls Team`,
          HTMLPart: `
            <h2>Security Alert</h2>
            <p>Hi ${user.username},</p>
            <p><strong>${description}</strong> on your Rolls account.</p>
            <ul>
              <li><strong>Time:</strong> ${timestamp}</li>
              ${event.details ? `<li><strong>Details:</strong> ${event.details}</li>` : ""}
              ${event.deviceInfo ? `<li><strong>Device:</strong> ${event.deviceInfo}</li>` : ""}
            </ul>
            <p style="color: #d00;">If this wasn't you, please secure your account immediately.</p>
            <p>— The Rolls Team</p>
          `,
        },
      ],
    });
  } catch (error) {
    console.error("Failed to send security notification:", error);
  }
}
