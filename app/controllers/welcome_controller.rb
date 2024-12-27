class WelcomeController < ApplicationController
  def index
    render json: { message: "Welcome to Guess The Flag Backend API!" }
  end
end
