# db/seeds.rb

puts "Seeding flags with real images from Flagpedia..."

Flag.create!(
  name: "United States",
  image_url: "https://flagpedia.net/data/flags/w580/us.png"
)

Flag.create!(
  name: "Canada",
  image_url: "https://flagpedia.net/data/flags/w580/ca.png"
)

Flag.create!(
  name: "Germany",
  image_url: "https://flagpedia.net/data/flags/w580/de.png"
)

Flag.create!(
  name: "Brazil",
  image_url: "https://flagpedia.net/data/flags/w580/br.png"
)

Flag.create!(
  name: "Japan",
  image_url: "https://flagpedia.net/data/flags/w580/jp.png"
)

Flag.create!(
  name: "France",
  image_url: "https://flagpedia.net/data/flags/w580/fr.png"
)

Flag.create!(
  name: "United Kingdom",
  image_url: "https://flagpedia.net/data/flags/w580/gb.png"
)

Flag.create!(
  name: "Australia",
  image_url: "https://flagpedia.net/data/flags/w580/au.png"
)

Flag.create!(
  name: "Mexico",
  image_url: "https://flagpedia.net/data/flags/w580/mx.png"
)

Flag.create!(
  name: "Italy",
  image_url: "https://flagpedia.net/data/flags/w580/it.png"
)

puts "Done seeding flags!"
