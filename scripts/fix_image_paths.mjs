import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log("Analyzing database for incorrect image routing...")
  const { data: models, error } = await supabase.from('models').select('*')
  
  if (error) {
    console.error("Fetch error:", error)
    return
  }

  let count = 0;
  for (const model of models) {
    // Check if the image lacks the strict basePath prefix
    if (model.image && model.image.startsWith('/cars/')) {
        const fixedImage = '/DigiGarage' + model.image
        await supabase.from('models').update({ image: fixedImage }).eq('id', model.id)
        console.log(`[FIXED] Routed ${model.name} to -> ${fixedImage}`)
        count++;
    }
  }
  
  if(count === 0) {
      console.log("No broken basePath routes found!")
  } else {
      console.log(`Successfully mapped absolute routing for ${count} assets!`)
  }
}

run()
