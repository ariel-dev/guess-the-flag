# spec/graphql/mutations/create_game_session_spec.rb
require 'rails_helper'

RSpec.describe Mutations::CreateGameSession, type: :request do
  describe 'createGameSession' do
    it 'creates a new game session with a unique session code' do
      expect {
        post '/graphql',
             params: { query: mutation }.to_json, # Serialize params to JSON
             headers: { 'Content-Type' => 'application/json' }
      }.to change(GameSession, :count).by(1)

      json = JSON.parse(response.body)

      if json['errors']
        puts "GraphQL Errors: #{json['errors']}"
      end

      expect(json['errors']).to be_nil, "GraphQL Errors: #{json['errors']}"
      
      data = json['data']['createGameSession']['gameSession']
      
      expect(data).not_to be_nil
      expect(data['sessionCode']).to be_present
      expect(data['active']).to be_truthy
    end

    it 'ensures session_code uniqueness' do
      allow(SecureRandom).to receive(:alphanumeric)
        .and_return('DUPLICATE', 'DUPLICATE', 'NEWCODE')  # multiple returns
    
      GameSession.create!(session_code: 'DUPLICATE', active: true)
    
      expect {
        post '/graphql',
             params: { query: mutation }.to_json,
             headers: { 'Content-Type' => 'application/json' }
      }.to change(GameSession, :count).by(1)
    
      json = JSON.parse(response.body)
      expect(json['errors']).to be_nil
    
      data = json['data']['createGameSession']['gameSession']
      expect(data['sessionCode']).to eq('NEWCODE')  # Because the loop eventually found a new code
      expect(data['active']).to be_truthy
    end
    
  end

  def mutation
    <<~GQL
      mutation {
        createGameSession {
          gameSession {
            id
            sessionCode
            active
          }
        }
      }
    GQL
  end
end
