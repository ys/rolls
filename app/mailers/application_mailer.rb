class ApplicationMailer < ActionMailer::Base
  default from: -> { "#{ENV.fetch('MAILJET_FROM_NAME', 'Rolls')} <#{ENV.fetch('MAILJET_FROM_EMAIL', 'noreply@rolls.yannick.computer')}>" }
  layout "mailer"
end
