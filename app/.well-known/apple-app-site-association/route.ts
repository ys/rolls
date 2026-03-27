export function GET() {
  return new Response(
    JSON.stringify({
      webcredentials: {
        apps: ["CBY98TN945.computer.yannick.rolls"],
      },
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
