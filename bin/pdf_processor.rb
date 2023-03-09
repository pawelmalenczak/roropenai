# ================================================================
# Script Name: pdf_processor.rb
# Description: A script that processes a PDF file, creates two CSV 
# files with the page data and embeddings,and saves them in the 
# same directory as the PDF file.
#
# Run with: # rails runner bin/pdf_processor.rb my_pdf.pdf
# ================================================================

#!/usr/bin/env ruby

require "dotenv/load" if (ENV['RAILS_ENV'] == "development" || ENV['RAILS_ENV'] == "test")
require "pdf-reader"
require "openai"
require "csv"
require "tokenizers"


COMPLETIONS_MODEL = "text-davinci-003"
MODEL_NAME = "curie"
DOC_EMBEDDINGS_MODEL = "text-search-#{MODEL_NAME}-doc-001"

$tokenizer = Tokenizers.from_pretrained("gpt2")
$client = OpenAI::Client.new

def count_tokens(text)
  # Count the number of tokens in a string
  encoded = $tokenizer.encode(text)
  tokens = encoded.tokens
  count = tokens.length
end

def extract_pages(page_text, index)
  # Extract the text from the page
  content = page_text.strip
  if content.length > 0
    title = "Page #{index}"
    tokens = count_tokens(content) + 4
    [title, content, tokens]
  else
    nil
  end
end

def get_embedding(text, model_name)
  result = $client.embeddings(
    parameters: {
      model: model_name,
      input: text
    }
  )

  # Check if the result is valid
  if result["data"].nil? || result["data"].empty?
    raise "No embedding found for text: #{text}"
  end

  result["data"][0]["embedding"]
end

def get_doc_embedding(text)
  get_embedding(text, DOC_EMBEDDINGS_MODEL)
end

def compute_doc_embeddings(pages)
  embeddings = {}
  pages.each_with_index do |page, index|
    begin
      embeddings[index] = get_doc_embedding(page[1])
    rescue RuntimeError => e
      puts "Error computing embedding for #{page[0]}: #{e.message}"
    end
  end
  embeddings
end

# Parse command-line arguments
pdf_path = ARGV[0]

# Read PDF file
pages = []
reader = PDF::Reader.new(pdf_path)

reader.pages.each_with_index do |page, index|
  page_text = page.text
  page_data = extract_pages(page_text, index+1)
  pages << page_data if page_data
end

# Filter out pages with too many tokens
pages.select! { |page| page[2] < 2046 }
pages = pages.take(10)

# Compute document embeddings
embeddings = compute_doc_embeddings(pages)

CSV.open("#{pdf_path}.embeddings.csv", "wb") do |csv|
  csv << ["title"] + (0..4095).to_a
   embeddings.each_with_index do |embedding, index|
    csv << ["Page #{index+1}"] + embedding
  end
end

# Write page data to CSV file
CSV.open("#{pdf_path}.pages.csv", "wb") do |csv|
  csv << ["title", "content", "tokens"]
  pages.each do |page|
    csv << page
  end
end