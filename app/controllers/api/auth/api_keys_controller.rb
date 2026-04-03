module Api
  module Auth
    class ApiKeysController < BaseController
      before_action :require_api_auth!

      def index
        api_keys = current_user.api_keys.order(created_at: :desc)
        render json: api_keys.map { |k| serialize_key(k) }
      end

      def create
        raw_key = ApiKeyService.generate_raw_key
        key_hash = ApiKeyService.hash_key(raw_key)
        label = params[:label].presence || "API Key"

        api_key = current_user.api_keys.create!(
          id: SecureRandom.uuid,
          key_hash: key_hash,
          label: label,
          created_at: Time.current
        )

        render json: {
          api_key: serialize_key(api_key),
          raw_key: raw_key
        }, status: :created
      end

      def destroy
        api_key = current_user.api_keys.find_by(id: params[:id])
        return render_not_found unless api_key

        api_key.destroy!
        head :no_content
      end

      def cli_token
        raw_key = ApiKeyService.generate_raw_key
        key_hash = ApiKeyService.hash_key(raw_key)

        current_user.api_keys.create!(
          id: SecureRandom.uuid,
          key_hash: key_hash,
          label: "CLI",
          created_at: Time.current
        )

        callback = params[:callback]
        if callback.present?
          redirect_to "#{callback}?key=#{raw_key}", allow_other_host: true
        else
          render json: {raw_key: raw_key}
        end
      end
    end
  end
end
