def start
  # ... existing start game logic ...
  
  ActionCable.server.broadcast "game_session_#{@game_session.session_code}",
    event: 'game_started',
    data: { session_code: @game_session.session_code }
end 