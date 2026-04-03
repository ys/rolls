module Api
  module Auth
    class InvitesController < BaseController
      before_action :require_api_auth!, except: [:validate]

      def index
        invites = Invite.where(created_by: current_user.id).order(created_at: :desc)
        render json: invites.map { |i| serialize_invite(i) }
      end

      def create
        invite = Invite.create!(
          id: SecureRandom.uuid,
          created_by: current_user.id,
          max_uses: params[:max_uses] || 1,
          expires_at: params[:expires_at],
          created_at: Time.current
        )
        render json: serialize_invite(invite), status: :created
      end

      def destroy
        invite = Invite.find_by(id: params[:id], created_by: current_user.id)
        return render_not_found unless invite

        invite.destroy!
        head :no_content
      end

      def send_invite
        email = params[:email]
        return render_error('Email required') if email.blank?

        invite = Invite.find_by(id: params[:invite_id], created_by: current_user.id)
        return render_not_found unless invite

        # Send email via Mailjet
        InviteMailer.invite_email(
          to: email,
          from_user: current_user,
          invite: invite
        ).deliver_later

        render json: { success: true }
      end

      def validate
        code = params[:code]
        invite = Invite.find_by(code: code)

        if invite.nil?
          render json: { valid: false, error: 'Invite not found' }
        elsif invite.valid_invite?
          render json: { valid: true }
        elsif invite.expires_at&.past?
          render json: { valid: false, error: 'Invite expired' }
        else
          render json: { valid: false, error: 'Invite already used' }
        end
      end

      private

      def require_api_auth!
        unless logged_in?
          render json: { error: 'Unauthorized' }, status: :unauthorized
        end
      end

      def serialize_invite(invite)
        {
          id: invite.id,
          code: invite.code,
          max_uses: invite.max_uses,
          used_count: invite.used_count,
          expires_at: invite.expires_at,
          created_at: invite.created_at,
          used_at: invite.used_at
        }
      end
    end
  end
end
