require "aws-sdk-s3"

class R2Service
  def self.client
    @client ||= Aws::S3::Client.new(
      region: "auto",
      endpoint: "https://#{ENV.fetch("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com",
      access_key_id: ENV.fetch("R2_ACCESS_KEY_ID"),
      secret_access_key: ENV.fetch("R2_SECRET_ACCESS_KEY")
    )
  end

  def self.bucket
    ENV.fetch("R2_BUCKET")
  end

  def self.public_url(roll_number)
    "#{ENV.fetch("R2_PUBLIC_URL")}/#{roll_number}.webp"
  end

  def self.key_for(roll_number)
    "#{roll_number}.webp"
  end

  # Upload a contact sheet
  def self.upload(roll_number, body, content_type: "image/webp")
    client.put_object(
      bucket: bucket,
      key: key_for(roll_number),
      body: body,
      content_type: content_type
    )
    public_url(roll_number)
  end

  # Download a contact sheet as raw bytes
  def self.download(roll_number)
    response = client.get_object(
      bucket: bucket,
      key: key_for(roll_number)
    )
    {
      body: response.body.read,
      content_type: response.content_type
    }
  rescue Aws::S3::Errors::NoSuchKey
    nil
  end

  # Check if a contact sheet exists
  def self.exists?(roll_number)
    client.head_object(
      bucket: bucket,
      key: key_for(roll_number)
    )
    true
  rescue Aws::S3::Errors::NotFound
    false
  end
end
