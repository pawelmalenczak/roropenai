Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post '/question/ask', to: 'question#ask'
    end
  end
  root 'root#index'
end
