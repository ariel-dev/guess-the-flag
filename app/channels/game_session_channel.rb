class GameSessionChannel < ApplicationCable::Channel
  def subscribed
    if params[:session_code].present?
      stream_from "game_session_#{params[:session_code]}"
    else
      reject
    end
  end

  def unsubscribed
    # Clean up any necessary state
    stop_all_streams
  end

  def receive(data)
    # Handle any incoming WebSocket messages
    Rails.logger.info "Received message: #{data}"
  end
end
