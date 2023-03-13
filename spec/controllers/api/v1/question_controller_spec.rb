require 'rails_helper'

RSpec.describe Api::V1::QuestionController, type: :controller do
  describe "POST #ask" do
    it "returns a question and its answer" do
      post :ask, params: { question: "What is The Minimalist Entrepreneur about?" }
      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      expect(json_response["question"]).to eq("What is The Minimalist Entrepreneur about?")
      expect(json_response["answer"]).to_not be_empty
    end

    it "caches the response" do
      allow(Rails.cache).to receive(:read).and_return(nil)
      expect(Rails.cache).to receive(:write).with("What is The Minimalist Entrepreneur about?", instance_of(Question), expires_in: 2.hours)

      post :ask, params: { question: "What is The Minimalist Entrepreneur about?" }
    end
  end

  describe "#load_embeddings" do
    it "loads the embeddings from a CSV file" do
      embeddings = subject.load_embeddings("book.pdf.embeddings.csv")
      expect(embeddings).to be_a(Hash)
    end
  end

  describe "#get_query_embedding" do
    it "returns an embedding for a given query" do
      embedding = subject.get_query_embedding("What is The Minimalist Entrepreneur about?")
      expect(embedding).to be_an(Array)
    end
  end

end
