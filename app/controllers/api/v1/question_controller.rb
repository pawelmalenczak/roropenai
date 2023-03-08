require 'dotenv/load'
require 'openai'
require 'numo/narray'
require 'json'

class Api::V1::QuestionController < ApplicationController
  skip_before_action :verify_authenticity_token

  MODEL_NAME = 'curie'
  COMPLETIONS_MODEL = 'text-davinci-003'
  COMPLETIONS_API_PARAMS = {
    # We use temperature of 0.0 because it gives the most predictable, factual answer.
    'temperature': 0.0,
    'max_tokens': 150,
    'model': COMPLETIONS_MODEL,
  }
  QUERY_EMBEDDINGS_MODEL = "text-search-#{MODEL_NAME}-query-001"


  $max_section_len = 500
  $separator = "\n* "
  $separator_len = 3

  def ask
    question_asked = params[:question]

    if !question_asked.ends_with?("?")
      question_asked += "?"
    end

    previous_question = Question.find_by(question: question_asked)
    previous_answer = previous_question&.answer

    # TO-DO: include audio_src_url
    # audio_src_url = previous_question&.audio_src_url
    audio_src_url = '#'

    if previous_answer
      puts "previously asked and answered: #{previous_question.answer}"
      previous_question.ask_count += 1
      previous_question.save

      # TO-DO: include audio_src_url
      render json: { question: previous_question.question, answer: previous_question.answer, id: previous_question.id }
    else
      data = CSV.read('book.pdf.pages.csv')
      document_embeddings = load_embeddings('book.pdf.embeddings.csv')
      answer, context = answer_query_with_context(question_asked, data, document_embeddings)

      # TO-DO: use resemble v2 and audio_src_url
      @question = Question.new(question: question_asked, context: context, answer: answer, audio_src_url: audio_src_url )
      # @question = Question.new(question_asked, context, answer, ask_count, audio_src_url)
      # @question = Question.new(question_asked, answer, context)
       puts "inspec #{@question.inspect}"
      @question.save
      # question = Question.new(question: question_asked, answer: answer, context: context)
      # question.save

      # TO-DO: include audio_src_url
      render json: { question: @question.question, answer: answer, id: @question.id }
    end
  end

  def load_embeddings(fname)
    data = CSV.read(fname, headers: true)
    max_dim = data.headers.reject { |h| h == 'title' }.map(&:to_i).max
    embeddings = {}

    data.each do |row|
      title = row['title']
      embeddings[title] = (0..max_dim).map { |i| row[i.to_s] }
    end

    embeddings
  end

  def get_embedding(text, model)
    client = OpenAI::Client.new
    result = client.embeddings(
      parameters: {
        model: model,
        input: text
      }
    )

    # Check if the result is valid
    if result["data"].nil? || result["data"].empty?
      raise "No embedding found for text: #{text}"
    end

    result["data"][0]["embedding"]
  end

  def get_query_embedding(text)
    get_embedding(text, QUERY_EMBEDDINGS_MODEL)
  end

  def vector_similarity(x, y)
    y_array = JSON.parse(y[1])

    x_arr = Numo::DFloat.cast(x)
    y_arr = Numo::DFloat.cast(y_array)

    return x_arr.dot(y_arr)
  end

  def order_document_sections_by_query_similarity(query, contexts)
    query_embedding = get_query_embedding(query)
    document_similarities = contexts.map do |doc_index, doc_embedding|
      [vector_similarity(query_embedding, doc_embedding), doc_index]
    end

    document_similarities.sort.reverse
  end

  def construct_prompt(question, context_embeddings, data)
    most_relevant_document_sections = order_document_sections_by_query_similarity(question, context_embeddings)
    chosen_sections = []
    chosen_sections_len = 0
    chosen_sections_indexes = []

    most_relevant_document_sections.each do |_, section_index|
      # select rows where the value in the 'title' column is equal to 'section_index'
      document_section = data.select { |row| row[0] == section_index }.first

      unless document_section.nil?
        chosen_sections_len += document_section[2].to_i + $separator_len
        if chosen_sections_len > $max_section_len
          space_left = $max_section_len - chosen_sections_len - $separator_len
          chosen_sections.push($separator + document_section[1][0..space_left])
          chosen_sections_indexes.push(section_index.to_s)
          break
        end
        chosen_sections.push($separator + document_section[1])
        chosen_sections_indexes.push(section_index.to_s)
      end
    end
    header = "Sahil Lavingia is the founder and CEO of Gumroad, and the author of the book The Minimalist Entrepreneur (also known as TME). These are questions and answers by him. Please keep your answers to three sentences maximum, and speak in complete sentences. Stop speaking once your point is made.\n\nContext that may be useful, pulled from The Minimalist Entrepreneur:\n"

    question_1 = "\n\n\nQ: How to choose what business to start?\n\nA: First off don't be in a rush. Look around you, see what problems you or other people are facing, and solve one of these problems if you see some overlap with your passions or skills. Or, even if you don't see an overlap, imagine how you would solve that problem anyway. Start super, super small."
    question_2 = "\n\n\nQ: Q: Should we start the business on the side first or should we put full effort right from the start?\n\nA:   Always on the side. Things start small and get bigger from there, and I don't know if I would ever “fully” commit to something unless I had some semblance of customer traction. Like with this product I'm working on now!"
    question_3 = "\n\n\nQ: Should we sell first than build or the other way around?\n\nA: I would recommend building first. Building will teach you a lot, and too many people use “sales” as an excuse to never learn essential skills like building. You can't sell a house you can't build!"
    question_4 = "\n\n\nQ: Andrew Chen has a book on this so maybe touché, but how should founders think about the cold start problem? Businesses are hard to start, and even harder to sustain but the latter is somewhat defined and structured, whereas the former is the vast unknown. Not sure if it's worthy, but this is something I have personally struggled with\n\nA: Hey, this is about my book, not his! I would solve the problem from a single player perspective first. For example, Gumroad is useful to a creator looking to sell something even if no one is currently using the platform. Usage helps, but it's not necessary."
    question_5 = "\n\n\nQ: What is one business that you think is ripe for a minimalist Entrepreneur innovation that isn't currently being pursued by your community?\n\nA: I would move to a place outside of a big city and watch how broken, slow, and non-automated most things are. And of course the big categories like housing, transportation, toys, healthcare, supply chain, food, and more, are constantly being upturned. Go to an industry conference and it's all they talk about! Any industry…"
    question_6 = "\n\n\nQ: How can you tell if your pricing is right? If you are leaving money on the table\n\nA: I would work backwards from the kind of success you want, how many customers you think you can reasonably get to within a few years, and then reverse engineer how much it should be priced to make that work."
    question_7 = "\n\n\nQ: Why is the name of your book 'the minimalist entrepreneur' \n\nA: I think more people should start businesses, and was hoping that making it feel more “minimal” would make it feel more achievable and lead more people to starting-the hardest step."
    question_8 = "\n\n\nQ: How long it takes to write TME\n\nA: About 500 hours over the course of a year or two, including book proposal and outline."
    question_9 = "\n\n\nQ: What is the best way to distribute surveys to test my product idea\n\nA: I use Google Forms and my email list / Twitter account. Works great and is 100% free."
    question_10 = "\n\n\nQ: How do you know, when to quit\n\nA: When I'm bored, no longer learning, not earning enough, getting physically unhealthy, etc… loads of reasons. I think the default should be to “quit” and work on something new. Few things are worth holding your attention for a long period of time."


    return [header, chosen_sections.join, question_1, question_2, question_3, question_4, question_5, question_6, question_7, question_8, question_9, question_10, "\n\n\nQ: #{question}\n\nA: "].join, chosen_sections.join

  end

  def answer_query_with_context(query, data, document_embeddings)
    prompt, context = construct_prompt(query, document_embeddings, data)
    
    # puts "===\n#{prompt}"

    client = OpenAI::Client.new
    response = client.completions(
      parameters: {
        prompt: prompt,
        temperature: 0.0,
        max_tokens: 150,
        model: COMPLETIONS_MODEL
      }
    )

    return response["choices"][0]["text"].strip, context
  end

end


private

def question_params
  params.permit(:question, :context, :answer, :ask_count, :audio_src_url)
  # params.require(:question).permit(:question, :context, :answer, :ask_count, :audio_src_url)
end

# def question
#   @question ||= Question.find(params[:id])
# end
