/**
 * Seed the hotwheels_catalog table in Supabase with scraped data
 *
 * Prerequisites:
 *   1. Run supabase-catalog-setup.sql in Supabase SQL Editor first
 *   2. Have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/seed-catalog.mjs
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing environment variables!');
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Usage:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \\');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=eyJ... \\');
  console.error('  node scripts/seed-catalog.mjs');
  process.exit(1);
}

// Use service role key to bypass RLS for seeding
const supabase = createClient(supabaseUrl, serviceKey);

const CATALOG_FILE = path.join(process.cwd(), 'scripts', 'hotwheels-catalog.json');
const BATCH_SIZE = 500;

async function seed() {
  console.log('═══════════════════════════════════════════════');
  console.log('  SEEDING HOT WHEELS CATALOG TO SUPABASE');
  console.log('═══════════════════════════════════════════════\n');

  // Load catalog data
  const raw = fs.readFileSync(CATALOG_FILE, 'utf-8');
  const catalog = JSON.parse(raw);
  console.log(`  Loaded ${catalog.length} models from ${CATALOG_FILE}\n`);

  // Check if table already has data
  const { count } = await supabase
    .from('hotwheels_catalog')
    .select('*', { count: 'exact', head: true });

  if (count && count > 0) {
    console.log(`  ⚠ Table already has ${count} rows.`);
    console.log('  Clearing existing data...');
    const { error: delError } = await supabase
      .from('hotwheels_catalog')
      .delete()
      .gte('catalog_id', 0);
    if (delError) {
      console.error('  ✗ Failed to clear:', delError.message);
      process.exit(1);
    }
    console.log('  ✓ Cleared.\n');
  }

  // Strip fields that may no longer exist as columns (color, case_code)
  const cleaned = catalog.map(({ color, case_code, ...rest }) => rest);

  // Insert in batches
  let inserted = 0;
  for (let i = 0; i < cleaned.length; i += BATCH_SIZE) {
    const batch = cleaned.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('hotwheels_catalog')
      .insert(batch);

    if (error) {
      console.error(`  ✗ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error.message);
      // Try inserting one by one to skip bad rows
      for (const item of batch) {
        const { error: singleError } = await supabase
          .from('hotwheels_catalog')
          .insert(item);
        if (!singleError) inserted++;
      }
    } else {
      inserted += batch.length;
    }

    process.stdout.write(`  Inserted: ${inserted}/${cleaned.length}\r`);
  }

  console.log(`\n\n═══════════════════════════════════════════════`);
  console.log(`  ✓ Seeded ${inserted} models into hotwheels_catalog`);
  console.log(`═══════════════════════════════════════════════`);
}

seed().catch(console.error);
