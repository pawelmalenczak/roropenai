class Question < ApplicationRecord
  validates :question, presence: true
  validates :context, presence: true
  validates :answer, presence: true
  validates :ask_count, presence: true
  validates :audio_src_url, presence: true
end
