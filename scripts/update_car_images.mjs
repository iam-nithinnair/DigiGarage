import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const SOURCE_IMAGES = {
  "Mazda MX-5 Miata": "C:\\Users\\nithin.nm\\.gemini\\antigravity\\brain\\625986f4-37f6-4c2e-a246-7f36b511781d\\mazda_mx5_1776684692496.png",
  "'16 Lamborghini Centenario Roadster": "C:\\Users\\nithin.nm\\.gemini\\antigravity\\brain\\625986f4-37f6-4c2e-a246-7f36b511781d\\lamborghini_centenario_1776684707680.png",
  "Gordon Murray Automotive T.33": "C:\\Users\\nithin.nm\\.gemini\\antigravity\\brain\\625986f4-37f6-4c2e-a246-7f36b511781d\\gordon_murray_t33_1776684722664.png",
  "Batmobile": "C:\\Users\\nithin.nm\\.gemini\\antigravity\\brain\\625986f4-37f6-4c2e-a246-7f36b511781d\\batmobile_1776684743669.png",
  "Pass 'n Go": "C:\\Users\\nithin.nm\\.gemini\\antigravity\\brain\\625986f4-37f6-4c2e-a246-7f36b511781d\\pass_n_go_1776684760254.png",
  "RD-06": "C:\\Users\\nithin.nm\\.gemini\\antigravity\\brain\\625986f4-37f6-4c2e-a246-7f36b511781d\\rd_06_1776684776280.png"
}

const PUBLIC_CARS_DIR = path.join(process.cwd(), 'public', 'cars')

// Create public/cars directory if it doesn't exist yet
if (!fs.existsSync(PUBLIC_CARS_DIR)) {
  fs.mkdirSync(PUBLIC_CARS_DIR, { recursive: true })
}

async function run() {
  console.log("Migrating generated studio images into local project directory...")
  for (const [name, sourcePath] of Object.entries(SOURCE_IMAGES)) {
      const fileName = path.basename(sourcePath)
      const targetPath = path.join(PUBLIC_CARS_DIR, fileName)
      
      try {
        fs.copyFileSync(sourcePath, targetPath)
        const imageUrl = `/cars/${fileName}`
        
        const { error } = await supabase.from('models').update({ image: imageUrl }).eq('name', name)
        if (error) {
           console.error(`Database rejection for ${name}:`, error)
        } else {
           console.log(`Successfully mapped studio photo for ${name}!`)
        }
      } catch (err) {
        console.error(`File move failed for ${name}:`, err.message)
      }
  }
}

run()
