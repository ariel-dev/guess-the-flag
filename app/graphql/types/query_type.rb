# frozen_string_literal: true

module Types
  class QueryType < Types::BaseObject
    field :node, Types::NodeType, null: true, description: "Fetches an object given its ID." do
      argument :id, ID, required: true, description: "ID of the object."
    end

    def node(id:)
      context.schema.object_from_id(id, context)
    end

    field :nodes, [Types::NodeType, null: true], null: true, description: "Fetches a list of objects given a list of IDs." do
      argument :ids, [ID], required: true, description: "IDs of the objects."
    end

    def nodes(ids:)
      ids.map { |id| context.schema.object_from_id(id, context) }
    end

    # Add root-level fields here.
    # They will be entry points for queries on your schema.

   # Add `hello` field to the Query type
   field :hello, String, null: false,
   description: "An example field added by the generator"

    def hello
      "Hello, world!"
    end


    # New field: gameSession
    field :game_session, Types::GameSessionType, null: true,
      description: "Find a game session by its session code" do
        argument :session_code, String, required: true
      end

    def game_session(session_code:)
      GameSession.find_by(session_code: session_code)
    end

    field :flags, [FlagType], null: false,
    description: "Retrieve a list of all flags"

    def flags
      # Return all Flag records from the database
      Flag.all
    end

    field :get_current_question, Types::QuestionType, null: true do
      description "Retrieve the current question for a given session code"
      argument :session_code, String, required: true
    end
    
    def get_current_question(session_code:)
      # For simplicity, assume we store a "current_question_id" on the GameSession
      game_session = GameSession.find_by(session_code: session_code)
      return nil unless game_session && game_session.current_question_id
    
      Question.find(game_session.current_question_id)
    end
  end
end
