import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const hotWheels2026 = [
  "Mazda MX-5 Miata",
  "'16 Lamborghini Centenario Roadster",
  "Gordon Murray Automotive T.33",
  "Batmobile",
  "Pass 'n Go",
  "RD-06"
]

const modelsToInsert = hotWheels2026.map((name, index) => ({
  id: (Date.now() + index).toString(), // Ensuring slightly unique sequential IDs
  name: name,
  year: "2026",
  manufacturer: "Hot Wheels",
  series: "Basic Line",
  scale: "1:64",
  isFavorite: false,
  image: "" 
}))

async function addData() {
  console.log("Connecting to Supabase at", supabaseUrl)
  const { error } = await supabase.from('models').insert(modelsToInsert)
  
  if (error) {
    console.error("Failed to insert into Supabase:", error.message)
  } else {
    console.log(`Successfully injected ${hotWheels2026.length} new 2026 Hot Wheels into your collection!`)
  }
}

addData()
