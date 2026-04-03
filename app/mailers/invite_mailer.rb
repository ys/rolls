class InviteMailer < ApplicationMailer
  def invite_email(to:, from_user:, invite:)
    @from_user = from_user
    @invite = invite
    @app_url = ENV.fetch('APP_URL', 'https://rolls.yannick.computer')
    @register_url = "#{@app_url}/register?invite=#{invite.code}"

    mail(
      to: to,
      subject: "#{from_user.username} invited you to Rolls"
    )
  end
end
