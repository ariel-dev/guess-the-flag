class GameSessionChannel < ApplicationCable::Channel
  def subscribed
    # Expect params[:session_code] to be passed during subscription
    @session_code = params[:session_code]

    # Stream from a unique identifier based on the session_code
    stream_from "game_session_#{@session_code}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
