require 'spec_helper'
ENV['RAILS_ENV'] ||= 'test'
ENV['JWT_SECRET'] ||= 'test-secret-key-for-specs'
ENV['WEBAUTHN_RP_ID'] ||= 'localhost'
ENV['WEBAUTHN_RP_NAME'] ||= 'Rolls Test'
ENV['WEBAUTHN_ORIGIN'] ||= 'http://localhost:3000'
require_relative '../config/environment'
abort("The Rails environment is running in production mode!") if Rails.env.production?
require 'rspec/rails'
require 'factory_bot_rails'
require 'shoulda/matchers'

Rails.root.glob('spec/support/**/*.rb').sort_by(&:to_s).each { |f| require f }

begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  abort e.to_s.strip
end

RSpec.configure do |config|
  config.fixture_paths = [
    Rails.root.join('spec/fixtures')
  ]

  config.use_transactional_fixtures = true

  config.include FactoryBot::Syntax::Methods

  config.filter_rails_from_backtrace!

  config.include Rails.application.routes.url_helpers
end

Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end
