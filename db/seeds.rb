# db/seeds.rb

puts "Seeding Flags, Questions, and Choices..."

# Clear existing data to prevent duplicates (optional)
# Be cautious with this in production environments
GameSession.destroy_all
Player.destroy_all
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
  },
  {
    flag_name: "Mexico",
    image_url: "https://flagpedia.net/data/flags/w580/mx.png",
    correct_answer: "Mexico",
    incorrect_answers: ["Brazil", "Colombia", "Spain"]
  },
  {
    flag_name: "China",
    image_url: "https://flagpedia.net/data/flags/w580/cn.png",
    correct_answer: "China",
    incorrect_answers: ["Japan", "Vietnam", "South Korea"]
  },
  {
    flag_name: "India",
    image_url: "https://flagpedia.net/data/flags/w580/in.png",
    correct_answer: "India",
    incorrect_answers: ["Pakistan", "Bangladesh", "Sri Lanka"]
  },
  {
    flag_name: "South Africa",
    image_url: "https://flagpedia.net/data/flags/w580/za.png",
    correct_answer: "South Africa",
    incorrect_answers: ["Nigeria", "Kenya", "Egypt"]
  },
  {
    flag_name: "Russia",
    image_url: "https://flagpedia.net/data/flags/w580/ru.png",
    correct_answer: "Russia",
    incorrect_answers: ["Ukraine", "Poland", "Finland"]
  },
  {
    flag_name: "Argentina",
    image_url: "https://flagpedia.net/data/flags/w580/ar.png",
    correct_answer: "Argentina",
    incorrect_answers: ["Uruguay", "Chile", "Brazil"]
  },
  {
    flag_name: "Sweden",
    image_url: "https://flagpedia.net/data/flags/w580/se.png",
    correct_answer: "Sweden",
    incorrect_answers: ["Norway", "Finland", "Denmark"]
  },
  {
    flag_name: "Egypt",
    image_url: "https://flagpedia.net/data/flags/w580/eg.png",
    correct_answer: "Egypt",
    incorrect_answers: ["Morocco", "Tunisia", "Algeria"]
  },
  {
    flag_name: "South Korea",
    image_url: "https://flagpedia.net/data/flags/w580/kr.png",
    correct_answer: "South Korea",
    incorrect_answers: ["Japan", "China", "Vietnam"]
  },
  {
    flag_name: "New Zealand",
    image_url: "https://flagpedia.net/data/flags/w580/nz.png",
    correct_answer: "New Zealand",
    incorrect_answers: ["Australia", "Fiji", "Samoa"]
  },
  {
    flag_name: "Netherlands",
    image_url: "https://flagpedia.net/data/flags/w580/nl.png",
    correct_answer: "Netherlands",
    incorrect_answers: ["Luxembourg", "France", "Russia"]
  },
  {
    flag_name: "Switzerland",
    image_url: "https://flagpedia.net/data/flags/w580/ch.png",
    correct_answer: "Switzerland",
    incorrect_answers: ["Austria", "Denmark", "Norway"]
  },
  {
    flag_name: "Portugal",
    image_url: "https://flagpedia.net/data/flags/w580/pt.png",
    correct_answer: "Portugal",
    incorrect_answers: ["Spain", "Italy", "Romania"]
  },
  {
    flag_name: "Greece",
    image_url: "https://flagpedia.net/data/flags/w580/gr.png",
    correct_answer: "Greece",
    incorrect_answers: ["Cyprus", "Israel", "Turkey"]
  },
  {
    flag_name: "Turkey",
    image_url: "https://flagpedia.net/data/flags/w580/tr.png",
    correct_answer: "Turkey",
    incorrect_answers: ["Tunisia", "Pakistan", "Azerbaijan"]
  },
  {
    flag_name: "Poland",
    image_url: "https://flagpedia.net/data/flags/w580/pl.png",
    correct_answer: "Poland",
    incorrect_answers: ["Indonesia", "Monaco", "Austria"]
  },
  {
    flag_name: "Ukraine",
    image_url: "https://flagpedia.net/data/flags/w580/ua.png",
    correct_answer: "Ukraine",
    incorrect_answers: ["Sweden", "Colombia", "Romania"]
  },
  {
    flag_name: "Thailand",
    image_url: "https://flagpedia.net/data/flags/w580/th.png",
    correct_answer: "Thailand",
    incorrect_answers: ["Costa Rica", "North Korea", "Cambodia"]
  },
  {
    flag_name: "Vietnam",
    image_url: "https://flagpedia.net/data/flags/w580/vn.png",
    correct_answer: "Vietnam",
    incorrect_answers: ["China", "Morocco", "Ghana"]
  },
  {
    flag_name: "Singapore",
    image_url: "https://flagpedia.net/data/flags/w580/sg.png",
    correct_answer: "Singapore",
    incorrect_answers: ["Indonesia", "Poland", "Turkey"]
  },
  {
    flag_name: "Ireland",
    image_url: "https://flagpedia.net/data/flags/w580/ie.png",
    correct_answer: "Ireland",
    incorrect_answers: ["Ivory Coast", "Italy", "Hungary"]
  },
  {
    flag_name: "Norway",
    image_url: "https://flagpedia.net/data/flags/w580/no.png",
    correct_answer: "Norway",
    incorrect_answers: ["Iceland", "Denmark", "Finland"]
  },
  {
    flag_name: "Finland",
    image_url: "https://flagpedia.net/data/flags/w580/fi.png",
    correct_answer: "Finland",
    incorrect_answers: ["Sweden", "Norway", "Iceland"]
  },
  {
    flag_name: "Denmark",
    image_url: "https://flagpedia.net/data/flags/w580/dk.png",
    correct_answer: "Denmark",
    incorrect_answers: ["Sweden", "Norway", "Switzerland"]
  },
  {
    flag_name: "Belgium",
    image_url: "https://flagpedia.net/data/flags/w580/be.png",
    correct_answer: "Belgium",
    incorrect_answers: ["Germany", "Romania", "Chad"]
  },
  {
    flag_name: "Austria",
    image_url: "https://flagpedia.net/data/flags/w580/at.png",
    correct_answer: "Austria",
    incorrect_answers: ["Latvia", "Poland", "Peru"]
  },
  {
    flag_name: "Croatia",
    image_url: "https://flagpedia.net/data/flags/w580/hr.png",
    correct_answer: "Croatia",
    incorrect_answers: ["Slovakia", "Slovenia", "Serbia"]
  },
  {
    flag_name: "Czech Republic",
    image_url: "https://flagpedia.net/data/flags/w580/cz.png",
    correct_answer: "Czech Republic",
    incorrect_answers: ["Slovakia", "Slovenia", "Russia"]
  },
  {
    flag_name: "Romania",
    image_url: "https://flagpedia.net/data/flags/w580/ro.png",
    correct_answer: "Romania",
    incorrect_answers: ["Chad", "Moldova", "Andorra"]
  },
  {
    flag_name: "Hungary",
    image_url: "https://flagpedia.net/data/flags/w580/hu.png",
    correct_answer: "Hungary",
    incorrect_answers: ["Bulgaria", "Italy", "Iran"]
  },
  {
    flag_name: "Iceland",
    image_url: "https://flagpedia.net/data/flags/w580/is.png",
    correct_answer: "Iceland",
    incorrect_answers: ["Norway", "Finland", "Faroe Islands"]
  },
  {
    flag_name: "Estonia",
    image_url: "https://flagpedia.net/data/flags/w580/ee.png",
    correct_answer: "Estonia",
    incorrect_answers: ["Latvia", "Lithuania", "Finland"]
  },
  {
    flag_name: "Latvia",
    image_url: "https://flagpedia.net/data/flags/w580/lv.png",
    correct_answer: "Latvia",
    incorrect_answers: ["Austria", "Lebanon", "Estonia"]
  },
  {
    flag_name: "Lithuania",
    image_url: "https://flagpedia.net/data/flags/w580/lt.png",
    correct_answer: "Lithuania",
    incorrect_answers: ["Ethiopia", "Bolivia", "Colombia"]
  },
  {
    flag_name: "Slovakia",
    image_url: "https://flagpedia.net/data/flags/w580/sk.png",
    correct_answer: "Slovakia",
    incorrect_answers: ["Slovenia", "Russia", "Serbia"]
  },
  {
    flag_name: "Slovenia",
    image_url: "https://flagpedia.net/data/flags/w580/si.png",
    correct_answer: "Slovenia",
    incorrect_answers: ["Slovakia", "Russia", "Croatia"]
  },
  {
    flag_name: "Bulgaria",
    image_url: "https://flagpedia.net/data/flags/w580/bg.png",
    correct_answer: "Bulgaria",
    incorrect_answers: ["Hungary", "Iran", "Russia"]
  },
  {
    flag_name: "Serbia",
    image_url: "https://flagpedia.net/data/flags/w580/rs.png",
    correct_answer: "Serbia",
    incorrect_answers: ["Slovakia", "Russia", "Croatia"]
  },
  {
    flag_name: "Albania",
    image_url: "https://flagpedia.net/data/flags/w580/al.png",
    correct_answer: "Albania",
    incorrect_answers: ["Montenegro", "Macedonia", "Turkey"]
  },
  {
    flag_name: "Moldova",
    image_url: "https://flagpedia.net/data/flags/w580/md.png",
    correct_answer: "Moldova",
    incorrect_answers: ["Romania", "Andorra", "Chad"]
  },
  {
    flag_name: "Cyprus",
    image_url: "https://flagpedia.net/data/flags/w580/cy.png",
    correct_answer: "Cyprus",
    incorrect_answers: ["Greece", "Turkey", "Malta"]
  },
  {
    flag_name: "Malta",
    image_url: "https://flagpedia.net/data/flags/w580/mt.png",
    correct_answer: "Malta",
    incorrect_answers: ["Poland", "Monaco", "Lebanon"]
  },
  {
    flag_name: "Luxembourg",
    image_url: "https://flagpedia.net/data/flags/w580/lu.png",
    correct_answer: "Luxembourg",
    incorrect_answers: ["Netherlands", "France", "Russia"]
  },
  {
    flag_name: "Morocco",
    image_url: "https://flagpedia.net/data/flags/w580/ma.png",
    correct_answer: "Morocco",
    incorrect_answers: ["Tunisia", "Algeria", "Turkey"]
  },
  {
    flag_name: "Tunisia",
    image_url: "https://flagpedia.net/data/flags/w580/tn.png",
    correct_answer: "Tunisia",
    incorrect_answers: ["Turkey", "Morocco", "Algeria"]
  },
  {
    flag_name: "Algeria",
    image_url: "https://flagpedia.net/data/flags/w580/dz.png",
    correct_answer: "Algeria",
    incorrect_answers: ["Tunisia", "Morocco", "Libya"]
  },
  {
    flag_name: "Libya",
    image_url: "https://flagpedia.net/data/flags/w580/ly.png",
    correct_answer: "Libya",
    incorrect_answers: ["Syria", "Iraq", "Sudan"]
  },
  {
    flag_name: "Nigeria",
    image_url: "https://flagpedia.net/data/flags/w580/ng.png",
    correct_answer: "Nigeria",
    incorrect_answers: ["Senegal", "Cameroon", "Ghana"]
  },
  {
    flag_name: "Kenya",
    image_url: "https://flagpedia.net/data/flags/w580/ke.png",
    correct_answer: "Kenya",
    incorrect_answers: ["Ethiopia", "Uganda", "Tanzania"]
  },
  {
    flag_name: "Ethiopia",
    image_url: "https://flagpedia.net/data/flags/w580/et.png",
    correct_answer: "Ethiopia",
    incorrect_answers: ["Ghana", "Senegal", "Kenya"]
  },
  {
    flag_name: "Ghana",
    image_url: "https://flagpedia.net/data/flags/w580/gh.png",
    correct_answer: "Ghana",
    incorrect_answers: ["Senegal", "Cameroon", "Nigeria"]
  },
  {
    flag_name: "Senegal",
    image_url: "https://flagpedia.net/data/flags/w580/sn.png",
    correct_answer: "Senegal",
    incorrect_answers: ["Mali", "Cameroon", "Guinea"]
  },
  {
    flag_name: "Uganda",
    image_url: "https://flagpedia.net/data/flags/w580/ug.png",
    correct_answer: "Uganda",
    incorrect_answers: ["Kenya", "Zimbabwe", "Zambia"]
  },
  {
    flag_name: "Tanzania",
    image_url: "https://flagpedia.net/data/flags/w580/tz.png",
    correct_answer: "Tanzania",
    incorrect_answers: ["Kenya", "Uganda", "Mozambique"]
  },
  {
    flag_name: "Angola",
    image_url: "https://flagpedia.net/data/flags/w580/ao.png",
    correct_answer: "Angola",
    incorrect_answers: ["Mozambique", "Zimbabwe", "Zambia"]
  },
  {
    flag_name: "Saudi Arabia",
    image_url: "https://flagpedia.net/data/flags/w580/sa.png",
    correct_answer: "Saudi Arabia",
    incorrect_answers: ["Pakistan", "Iraq", "Iran"]
  },
  {
    flag_name: "Iran",
    image_url: "https://flagpedia.net/data/flags/w580/ir.png",
    correct_answer: "Iran",
    incorrect_answers: ["Iraq", "Syria", "Pakistan"]
  },
  {
    flag_name: "Iraq",
    image_url: "https://flagpedia.net/data/flags/w580/iq.png",
    correct_answer: "Iraq",
    incorrect_answers: ["Syria", "Iran", "Yemen"]
  },
  {
    flag_name: "Pakistan",
    image_url: "https://flagpedia.net/data/flags/w580/pk.png",
    correct_answer: "Pakistan",
    incorrect_answers: ["Saudi Arabia", "Iran", "Turkey"]
  },
  {
    flag_name: "Afghanistan",
    image_url: "https://flagpedia.net/data/flags/w580/af.png",
    correct_answer: "Afghanistan",
    incorrect_answers: ["Pakistan", "Tajikistan", "Iran"]
  },
  {
    flag_name: "Israel",
    image_url: "https://flagpedia.net/data/flags/w580/il.png",
    correct_answer: "Israel",
    incorrect_answers: ["Greece", "Argentina", "Uruguay"]
  },
  {
    flag_name: "Malaysia",
    image_url: "https://flagpedia.net/data/flags/w580/my.png",
    correct_answer: "Malaysia",
    incorrect_answers: ["Indonesia", "Thailand", "Singapore"]
  },
  {
    flag_name: "Indonesia",
    image_url: "https://flagpedia.net/data/flags/w580/id.png",
    correct_answer: "Indonesia",
    incorrect_answers: ["Monaco", "Poland", "Singapore"]
  },
  {
    flag_name: "Philippines",
    image_url: "https://flagpedia.net/data/flags/w580/ph.png",
    correct_answer: "Philippines",
    incorrect_answers: ["Czech Republic", "Cuba", "Chile"]
  },
  {
    flag_name: "Mongolia",
    image_url: "https://flagpedia.net/data/flags/w580/mn.png",
    correct_answer: "Mongolia",
    incorrect_answers: ["Kazakhstan", "Kyrgyzstan", "Vietnam"]
  },
  {
    flag_name: "North Korea",
    image_url: "https://flagpedia.net/data/flags/w580/kp.png",
    correct_answer: "North Korea",
    incorrect_answers: ["South Korea", "Vietnam", "China"]
  },
  {
    flag_name: "Cambodia",
    image_url: "https://flagpedia.net/data/flags/w580/kh.png",
    correct_answer: "Cambodia",
    incorrect_answers: ["Thailand", "Laos", "Vietnam"]
  },
  {
    flag_name: "Sri Lanka",
    image_url: "https://flagpedia.net/data/flags/w580/lk.png",
    correct_answer: "Sri Lanka",
    incorrect_answers: ["India", "Bangladesh", "Myanmar"]
  },
  {
    flag_name: "Bangladesh",
    image_url: "https://flagpedia.net/data/flags/w580/bd.png",
    correct_answer: "Bangladesh",
    incorrect_answers: ["Pakistan", "India", "Myanmar"]
  },
  {
    flag_name: "Nepal",
    image_url: "https://flagpedia.net/data/flags/w580/np.png",
    correct_answer: "Nepal",
    incorrect_answers: ["Bhutan", "Tibet", "India"]
  },
  {
    flag_name: "Myanmar",
    image_url: "https://flagpedia.net/data/flags/w580/mm.png",
    correct_answer: "Myanmar",
    incorrect_answers: ["Laos", "Cambodia", "Thailand"]
  },
  {
    flag_name: "Laos",
    image_url: "https://flagpedia.net/data/flags/w580/la.png",
    correct_answer: "Laos",
    incorrect_answers: ["Thailand", "Cambodia", "Vietnam"]
  },
  {
    flag_name: "Chile",
    image_url: "https://flagpedia.net/data/flags/w580/cl.png",
    correct_answer: "Chile",
    incorrect_answers: ["Texas", "Czech Republic", "Cuba"]
  },
  {
    flag_name: "Peru",
    image_url: "https://flagpedia.net/data/flags/w580/pe.png",
    correct_answer: "Peru",
    incorrect_answers: ["Canada", "Austria", "Indonesia"]
  },
  {
    flag_name: "Colombia",
    image_url: "https://flagpedia.net/data/flags/w580/co.png",
    correct_answer: "Colombia",
    incorrect_answers: ["Venezuela", "Ecuador", "Romania"]
  },
  {
    flag_name: "Venezuela",
    image_url: "https://flagpedia.net/data/flags/w580/ve.png",
    correct_answer: "Venezuela",
    incorrect_answers: ["Colombia", "Ecuador", "Bolivia"]
  },
  {
    flag_name: "Ecuador",
    image_url: "https://flagpedia.net/data/flags/w580/ec.png",
    correct_answer: "Ecuador",
    incorrect_answers: ["Colombia", "Venezuela", "Bolivia"]
  },
  {
    flag_name: "Bolivia",
    image_url: "https://flagpedia.net/data/flags/w580/bo.png",
    correct_answer: "Bolivia",
    incorrect_answers: ["Lithuania", "Ghana", "Ethiopia"]
  },
  {
    flag_name: "Paraguay",
    image_url: "https://flagpedia.net/data/flags/w580/py.png",
    correct_answer: "Paraguay",
    incorrect_answers: ["Netherlands", "Luxembourg", "Croatia"]
  },
  {
    flag_name: "Uruguay",
    image_url: "https://flagpedia.net/data/flags/w580/uy.png",
    correct_answer: "Uruguay",
    incorrect_answers: ["Greece", "Argentina", "Israel"]
  },
  {
    flag_name: "Cuba",
    image_url: "https://flagpedia.net/data/flags/w580/cu.png",
    correct_answer: "Cuba",
    incorrect_answers: ["Puerto Rico", "Chile", "Czech Republic"]
  },
  {
    flag_name: "Jamaica",
    image_url: "https://flagpedia.net/data/flags/w580/jm.png",
    correct_answer: "Jamaica",
    incorrect_answers: ["Saint Lucia", "Barbados", "Trinidad and Tobago"]
  },
  {
    flag_name: "Panama",
    image_url: "https://flagpedia.net/data/flags/w580/pa.png",
    correct_answer: "Panama",
    incorrect_answers: ["Costa Rica", "Cuba", "Dominican Republic"]
  },
  {
    flag_name: "Costa Rica",
    image_url: "https://flagpedia.net/data/flags/w580/cr.png",
    correct_answer: "Costa Rica",
    incorrect_answers: ["Thailand", "North Korea", "Panama"]
  },
  {
    flag_name: "Dominican Republic",
    image_url: "https://flagpedia.net/data/flags/w580/do.png",
    correct_answer: "Dominican Republic",
    incorrect_answers: ["Haiti", "Cuba", "Puerto Rico"]
  },
  {
    flag_name: "Haiti",
    image_url: "https://flagpedia.net/data/flags/w580/ht.png",
    correct_answer: "Haiti",
    incorrect_answers: ["Dominican Republic", "Liechtenstein", "France"]
  },
  {
    flag_name: "Kazakhstan",
    image_url: "https://flagpedia.net/data/flags/w580/kz.png",
    correct_answer: "Kazakhstan",
    incorrect_answers: ["Mongolia", "Uzbekistan", "Kyrgyzstan"]
  },
  {
    flag_name: "Azerbaijan",
    image_url: "https://flagpedia.net/data/flags/w580/az.png",
    correct_answer: "Azerbaijan",
    incorrect_answers: ["Turkey", "Pakistan", "Turkmenistan"]
  },
  {
    flag_name: "Georgia",
    image_url: "https://flagpedia.net/data/flags/w580/ge.png",
    correct_answer: "Georgia",
    incorrect_answers: ["England", "Switzerland", "Denmark"]
  },
  {
    flag_name: "Armenia",
    image_url: "https://flagpedia.net/data/flags/w580/am.png",
    correct_answer: "Armenia",
    incorrect_answers: ["Colombia", "Venezuela", "Romania"]
  },
  {
    flag_name: "Uzbekistan",
    image_url: "https://flagpedia.net/data/flags/w580/uz.png",
    correct_answer: "Uzbekistan",
    incorrect_answers: ["Kazakhstan", "Turkmenistan", "Kyrgyzstan"]
  },
  {
    flag_name: "Turkmenistan",
    image_url: "https://flagpedia.net/data/flags/w580/tm.png",
    correct_answer: "Turkmenistan",
    incorrect_answers: ["Pakistan", "Uzbekistan", "Kazakhstan"]
  },
  {
    flag_name: "Kyrgyzstan",
    image_url: "https://flagpedia.net/data/flags/w580/kg.png",
    correct_answer: "Kyrgyzstan",
    incorrect_answers: ["Kazakhstan", "Uzbekistan", "Tajikistan"]
  },
  {
    flag_name: "Tajikistan",
    image_url: "https://flagpedia.net/data/flags/w580/tj.png",
    correct_answer: "Tajikistan",
    incorrect_answers: ["Iran", "Kurdistan", "Hungary"]
  },
  {
    flag_name: "Botswana",
    image_url: "https://flagpedia.net/data/flags/w580/bw.png",
    correct_answer: "Botswana",
    incorrect_answers: ["Namibia", "Zimbabwe", "Lesotho"]
  },
  {
    flag_name: "Namibia",
    image_url: "https://flagpedia.net/data/flags/w580/na.png",
    correct_answer: "Namibia",
    incorrect_answers: ["Botswana", "South Africa", "Angola"]
  },
  {
    flag_name: "Lesotho",
    image_url: "https://flagpedia.net/data/flags/w580/ls.png",
    correct_answer: "Lesotho",
    incorrect_answers: ["Eswatini", "Botswana", "South Africa"]
  },
  {
    flag_name: "Eswatini",
    image_url: "https://flagpedia.net/data/flags/w580/sz.png",
    correct_answer: "Eswatini",
    incorrect_answers: ["Lesotho", "Malawi", "Zimbabwe"]
  },
  {
    flag_name: "Comoros",
    image_url: "https://flagpedia.net/data/flags/w580/km.png",
    correct_answer: "Comoros",
    incorrect_answers: ["Mauritius", "Seychelles", "Madagascar"]
  },
  {
    flag_name: "Mauritius",
    image_url: "https://flagpedia.net/data/flags/w580/mu.png",
    correct_answer: "Mauritius",
    incorrect_answers: ["Seychelles", "Comoros", "Madagascar"]
  },
  {
    flag_name: "Seychelles",
    image_url: "https://flagpedia.net/data/flags/w580/sc.png",
    correct_answer: "Seychelles",
    incorrect_answers: ["Mauritius", "Comoros", "Maldives"]
  },
  {
    flag_name: "Cape Verde",
    image_url: "https://flagpedia.net/data/flags/w580/cv.png",
    correct_answer: "Cape Verde",
    incorrect_answers: ["São Tomé and Príncipe", "Guinea-Bissau", "Mauritania"]
  },
  {
    flag_name: "São Tomé and Príncipe",
    image_url: "https://flagpedia.net/data/flags/w580/st.png",
    correct_answer: "São Tomé and Príncipe",
    incorrect_answers: ["Cape Verde", "Equatorial Guinea", "Gabon"]
  },
  {
    flag_name: "Equatorial Guinea",
    image_url: "https://flagpedia.net/data/flags/w580/gq.png",
    correct_answer: "Equatorial Guinea",
    incorrect_answers: ["Gabon", "Cameroon", "São Tomé and Príncipe"]
  },
  {
    flag_name: "Gabon",
    image_url: "https://flagpedia.net/data/flags/w580/ga.png",
    correct_answer: "Gabon",
    incorrect_answers: ["Congo", "Cameroon", "Central African Republic"]
  },
  {
    flag_name: "Congo",
    image_url: "https://flagpedia.net/data/flags/w580/cg.png",
    correct_answer: "Congo",
    incorrect_answers: ["DR Congo", "Gabon", "Central African Republic"]
  },
  {
    flag_name: "DR Congo",
    image_url: "https://flagpedia.net/data/flags/w580/cd.png",
    correct_answer: "DR Congo",
    incorrect_answers: ["Congo", "Angola", "Zambia"]
  },
  {
    flag_name: "Central African Republic",
    image_url: "https://flagpedia.net/data/flags/w580/cf.png",
    correct_answer: "Central African Republic",
    incorrect_answers: ["South Sudan", "DR Congo", "Chad"]
  },
  {
    flag_name: "South Sudan",
    image_url: "https://flagpedia.net/data/flags/w580/ss.png",
    correct_answer: "South Sudan",
    incorrect_answers: ["Sudan", "Ethiopia", "Kenya"]
  },
  {
    flag_name: "Burundi",
    image_url: "https://flagpedia.net/data/flags/w580/bi.png",
    correct_answer: "Burundi",
    incorrect_answers: ["Rwanda", "Tanzania", "Uganda"]
  },
  {
    flag_name: "Rwanda",
    image_url: "https://flagpedia.net/data/flags/w580/rw.png",
    correct_answer: "Rwanda",
    incorrect_answers: ["Burundi", "DR Congo", "Uganda"]
  },
  {
    flag_name: "Guinea-Bissau",
    image_url: "https://flagpedia.net/data/flags/w580/gw.png",
    correct_answer: "Guinea-Bissau",
    incorrect_answers: ["Guinea", "Senegal", "The Gambia"]
  },
  {
    flag_name: "The Gambia",
    image_url: "https://flagpedia.net/data/flags/w580/gm.png",
    correct_answer: "The Gambia",
    incorrect_answers: ["Senegal", "Guinea-Bissau", "Sierra Leone"]
  },
  {
    flag_name: "Sierra Leone",
    image_url: "https://flagpedia.net/data/flags/w580/sl.png",
    correct_answer: "Sierra Leone",
    incorrect_answers: ["Liberia", "Guinea", "The Gambia"]
  },
  {
    flag_name: "Liberia",
    image_url: "https://flagpedia.net/data/flags/w580/lr.png",
    correct_answer: "Liberia",
    incorrect_answers: ["United States", "Malaysia", "Sierra Leone"]
  },
  {
    flag_name: "Togo",
    image_url: "https://flagpedia.net/data/flags/w580/tg.png",
    correct_answer: "Togo",
    incorrect_answers: ["Ghana", "Benin", "Burkina Faso"]
  },
  {
    flag_name: "Benin",
    image_url: "https://flagpedia.net/data/flags/w580/bj.png",
    correct_answer: "Benin",
    incorrect_answers: ["Togo", "Nigeria", "Ghana"]
  },
  {
    flag_name: "Mauritania",
    image_url: "https://flagpedia.net/data/flags/w580/mr.png",
    correct_answer: "Mauritania",
    incorrect_answers: ["Morocco", "Algeria", "Western Sahara"]
  },
  {
    flag_name: "Montenegro",
    image_url: "https://flagpedia.net/data/flags/w580/me.png",
    correct_answer: "Montenegro",
    incorrect_answers: ["Albania", "North Macedonia", "Serbia"]
  },
  {
    flag_name: "North Macedonia",
    image_url: "https://flagpedia.net/data/flags/w580/mk.png",
    correct_answer: "North Macedonia",
    incorrect_answers: ["Albania", "Bulgaria", "Serbia"]
  },
  {
    flag_name: "Kosovo",
    image_url: "https://flagpedia.net/data/flags/w580/xk.png",
    correct_answer: "Kosovo",
    incorrect_answers: ["Serbia", "Albania", "Bosnia and Herzegovina"]
  },
  {
    flag_name: "Bosnia and Herzegovina",
    image_url: "https://flagpedia.net/data/flags/w580/ba.png",
    correct_answer: "Bosnia and Herzegovina",
    incorrect_answers: ["Croatia", "Serbia", "Slovenia"]
  },
  {
    flag_name: "Vatican City",
    image_url: "https://flagpedia.net/data/flags/w580/va.png",
    correct_answer: "Vatican City",
    incorrect_answers: ["San Marino", "Malta", "Italy"]
  },
  {
    flag_name: "San Marino",
    image_url: "https://flagpedia.net/data/flags/w580/sm.png",
    correct_answer: "San Marino",
    incorrect_answers: ["Vatican City", "Italy", "Monaco"]
  },
  {
    flag_name: "Monaco",
    image_url: "https://flagpedia.net/data/flags/w580/mc.png",
    correct_answer: "Monaco",
    incorrect_answers: ["Indonesia", "Poland", "Singapore"]
  },
  {
    flag_name: "Liechtenstein",
    image_url: "https://flagpedia.net/data/flags/w580/li.png",
    correct_answer: "Liechtenstein",
    incorrect_answers: ["Haiti", "Luxembourg", "Netherlands"]
  },
  {
    flag_name: "Andorra",
    image_url: "https://flagpedia.net/data/flags/w580/ad.png",
    correct_answer: "Andorra",
    incorrect_answers: ["Moldova", "Romania", "Chad"]
  },
  {
    flag_name: "El Salvador",
    image_url: "https://flagpedia.net/data/flags/w580/sv.png",
    correct_answer: "El Salvador",
    incorrect_answers: ["Nicaragua", "Honduras", "Guatemala"]
  },
  {
    flag_name: "Honduras",
    image_url: "https://flagpedia.net/data/flags/w580/hn.png",
    correct_answer: "Honduras",
    incorrect_answers: ["El Salvador", "Nicaragua", "Guatemala"]
  },
  {
    flag_name: "Nicaragua",
    image_url: "https://flagpedia.net/data/flags/w580/ni.png",
    correct_answer: "Nicaragua",
    incorrect_answers: ["Honduras", "El Salvador", "Argentina"]
  },
  {
    flag_name: "Guatemala",
    image_url: "https://flagpedia.net/data/flags/w580/gt.png",
    correct_answer: "Guatemala",
    incorrect_answers: ["Honduras", "El Salvador", "Nicaragua"]
  },
  {
    flag_name: "Belize",
    image_url: "https://flagpedia.net/data/flags/w580/bz.png",
    correct_answer: "Belize",
    incorrect_answers: ["Guatemala", "Honduras", "El Salvador"]
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
