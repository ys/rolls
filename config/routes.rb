Rails.application.routes.draw do
  # Health check
  get "up" => "rails/health#show", :as => :rails_health_check

  # Web frontend
  get "login" => "web/sessions#new", :as => :login
  post "login" => "web/sessions#create"
  get "register" => "web/registrations#new", :as => :register
  delete "logout" => "web/sessions#destroy", :as => :logout

  scope module: :web do
    root "rolls#index"
    get "archive" => "rolls#archive", :as => :archive
    get "stats" => "stats#index", :as => :stats
    get "settings" => "settings#index", :as => :settings
    resources :rolls
    resources :cameras
    resources :films

    namespace :admin do
      root to: "dashboard#index"
      resources :users, only: [:index]
      resources :catalog_films
    end
  end

  # API
  namespace :api do
    # Auth
    namespace :auth do
      get "me" => "sessions#me"
      post "logout" => "sessions#logout"
      get "bootstrap" => "sessions#bootstrap"
      post "check-username" => "sessions#check_username"

      post "webauthn/register-options" => "webauthn#register_options"
      post "webauthn/register-verify" => "webauthn#register_verify"
      post "webauthn/login-options" => "webauthn#login_options"
      post "webauthn/login-verify" => "webauthn#login_verify"
      post "webauthn/autofill-options" => "webauthn#autofill_options"

      get "cli-token" => "api_keys#cli_token"
      get "api-keys" => "api_keys#index"
      post "api-keys" => "api_keys#create"
      delete "api-keys/:id" => "api_keys#destroy", :as => :api_key

      delete "credentials/:id" => "credentials#destroy", :as => :credential

      patch "email-preferences" => "email_preferences#update"

      get "invites/validate" => "invites#validate"
      get "invites" => "invites#index"
      post "invites" => "invites#create"
      post "invites/send" => "invites#send_invite"
      delete "invites/:id" => "invites#destroy", :as => :invite

      post "apple" => "apple#create"
      post "apple/link" => "apple#link"
      delete "apple/link" => "apple#unlink"
    end

    # Rolls
    get "rolls/next" => "rolls#next_number"
    get "rolls/home" => "rolls#home"
    get "rolls/archive" => "rolls#archive"
    post "rolls/bulk-update" => "rolls#bulk_update"
    get "rolls/:id/contact-sheet" => "rolls#contact_sheet_show", :as => :roll_contact_sheet
    put "rolls/:id/contact-sheet" => "rolls#contact_sheet_upload"
    resources :rolls, except: [:new, :edit], param: :id

    # Cameras
    post "cameras/merge" => "cameras#merge"
    resources :cameras, except: [:new, :edit], param: :slug

    # Films
    post "films/merge" => "films#merge"
    resources :films, except: [:new, :edit], param: :slug

    # Catalog
    get "catalog/films" => "catalog#films"

    # Import / Export
    post "import" => "import_export#import"
    get "export" => "import_export#export"

    # Cache timestamps
    get "cache/timestamps" => "cache#timestamps"
  end

  # Apple App Site Association
  get ".well-known/apple-app-site-association" => "well_known#apple_app_site_association"
end
