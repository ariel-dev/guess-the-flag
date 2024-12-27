# db/seeds.rb

puts "Seeding Flags, Questions, and Choices..."

# Clear existing data to prevent duplicates (optional)
# Be cautious with this in production environments
Choice.destroy_all
Question.destroy_all
Flag.destroy_all



# Define seed data
seed_data = [
  {
    flag_name: "United States",
    image_url: "https://flagpedia.net/data/flags/w580/us.png",
    correct_answer: "United States",
    incorrect_answers: ["Canada", "Mexico", "United Kingdom"]
  },
  {
    flag_name: "Canada",
    image_url: "https://flagpedia.net/data/flags/w580/ca.png",
    correct_answer: "Canada",
    incorrect_answers: ["United States", "Australia", "Germany"]
  },
  {
    flag_name: "Germany",
    image_url: "https://flagpedia.net/data/flags/w580/de.png",
    correct_answer: "Germany",
    incorrect_answers: ["France", "Italy", "Spain"]
  },
  {
    flag_name: "Japan",
    image_url: "https://flagpedia.net/data/flags/w580/jp.png",
    correct_answer: "Japan",
    incorrect_answers: ["China", "South Korea", "Thailand"]
  },
  {
    flag_name: "Brazil",
    image_url: "https://flagpedia.net/data/flags/w580/br.png",
    correct_answer: "Brazil",
    incorrect_answers: ["Argentina", "Colombia", "Peru"]
  },
  {
    flag_name: "France",
    image_url: "https://flagpedia.net/data/flags/w580/fr.png",
    correct_answer: "France",
    incorrect_answers: ["Belgium", "Switzerland", "Netherlands"]
  },
  {
    flag_name: "Australia",
    image_url: "https://flagpedia.net/data/flags/w580/au.png",
    correct_answer: "Australia",
    incorrect_answers: ["New Zealand", "Fiji", "Samoa"]
  },
  {
    flag_name: "Italy",
    image_url: "https://flagpedia.net/data/flags/w580/it.png",
    correct_answer: "Italy",
    incorrect_answers: ["Spain", "Portugal", "Greece"]
  },
  {
    flag_name: "United Kingdom",
    image_url: "https://flagpedia.net/data/flags/w580/gb.png",
    correct_answer: "United Kingdom",
    incorrect_answers: ["Ireland", "Netherlands", "Sweden"]
  },
  {
    flag_name: "Spain",
    image_url: "https://flagpedia.net/data/flags/w580/es.png",
    correct_answer: "Spain",
    incorrect_answers: ["Portugal", "Italy", "Greece"]
  }
]

# Iterate over each seed data entry
seed_data.each do |entry|
  # Create Flag
  flag = Flag.create!(
    name: entry[:flag_name],
    image_url: entry[:image_url]
  )
  puts "Created Flag: #{flag.name}"

  # Create Question
  question = Question.create!(
    prompt: "Which country does this flag belong to?",
    flag: flag
  )
  puts "  Created Question: #{question.prompt}"

  # Prepare Choices
  choices = entry[:incorrect_answers].map do |incorrect|
    { label: incorrect, correct: false }
  end
  # Add the correct answer
  choices << { label: entry[:correct_answer], correct: true }

  # Shuffle choices to randomize their order
  choices.shuffle.each do |choice_data|
    choice = Choice.create!(
      label: choice_data[:label],
      correct: choice_data[:correct],
      question: question
    )
    puts "    Created Choice: #{choice.label} (Correct: #{choice.correct})"
  end
end

puts "Seeding completed successfully!"
