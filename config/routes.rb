Rails.application.routes.draw do
  # GraphQL endpoint
  post "/graphql", to: "graphql#execute"

  # GraphiQL interface (only in development)
  if Rails.env.development?
    mount GraphiQL::Rails::Engine, at: "/graphiql", graphql_path: "/graphql"
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  root 'welcome#index'
end
