class Flag < ApplicationRecord
  # Validations
  validates :name, presence: true
  validates :image_url, presence: true, format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]), message: "must be a valid URL" }
end
