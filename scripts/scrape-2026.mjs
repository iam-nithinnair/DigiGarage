/**
 * Scrape 2026 Hot Wheels data from Fandom Wiki and seed into Supabase
 * Usage: node scripts/scrape-2026.mjs
 *
 * Requires env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';

const WIKI_API = 'https://hotwheels.fandom.com/api.php';
const YEAR = 2026;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Helpers (same as main scraper) ──────────────────────────

/** Strip wiki table cell attributes: bgcolor="...", style="..." etc. before the pipe */
function stripCellAttributes(cell) {
  if (!cell) return '';
  return cell.replace(
    /^\s*(?:(?:bgcolor|style|align|valign|width|height|colspan|rowspan|class|id)\s*=\s*"[^"]*"\s*)+\|?\s*/gi,
    ''
  ).trim();
}

/** Remove wiki templates like {{NM|2025|white}}, {{KR}}, {{TH|2026}} */
function stripWikiTemplates(text) {
  if (!text) return '';
  return text.replace(/\{\{[^}]*?\}\}/g, '').trim();
}

function cleanWikiLink(text) {
  if (!text) return '';
  text = text.replace(/\[\[(File|Image):[^\]]*\]\]/gi, '');
  text = text.replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2');
  text = text.replace(/\[\[([^\]]*)\]\]/g, '$1');
  return text;
}

function cleanText(text) {
  if (!text) return '';
  text = text.replace(/<br\s*\/?>/gi, ' ');
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/'{2,3}/g, '');
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/​/g, '');
  return text.trim();
}

/** Full clean pipeline: attributes → templates → wiki links → HTML/text → normalize spaces */
function cleanCell(raw) {
  let result = cleanText(cleanWikiLink(stripWikiTemplates(stripCellAttributes(raw))));
  result = result.replace(/\s{2,}/g, ' ').trim();
  return result;
}

function extractImageName(text) {
  if (!text) return '';
  const match = text.match(/\[\[(File|Image):([^|\]]+)/i);
  return match ? match[2].trim() : '';
}

// ── Wiki Table Parser ────────────────────────────────────────

function parseWikiTables(wikitext) {
  const tables = [];
  const tableRegex = /\{\|[^\n]*\n([\s\S]*?)\n\|\}/g;
  let match;

  while ((match = tableRegex.exec(wikitext)) !== null) {
    const tableContent = match[1];
    const rows = tableContent.split(/\n\|\-\s*/);
    let headers = [];
    const dataRows = [];

    for (const row of rows) {
      const lines = row.split('\n').filter(l => l.trim());
      const headerLine = lines.find(l => l.trim().startsWith('!'));
      if (headerLine) {
        const fullHeader = lines
          .filter(l => l.trim().startsWith('!'))
          .map(l => l.replace(/^\s*!\s*/, ''))
          .join('!!');
        headers = fullHeader.split(/!!/).map(h => cleanCell(h));
        continue;
      }
      const cellLines = lines.filter(l => l.trim().startsWith('|'));
      if (cellLines.length === 0) continue;
      const fullRow = cellLines.map(l => l.replace(/^\s*\|\s*/, '')).join('||');
      const cells = fullRow.split(/\|\|/).map(c => c.trim());
      if (cells.length >= 2) dataRows.push(cells);
    }

    if (headers.length > 0 && dataRows.length > 0) {
      tables.push({ headers, rows: dataRows });
    }
  }
  return tables;
}

function mapTableToModels(table, year) {
  const { headers, rows } = table;
  const models = [];
  const colMap = {};

  headers.forEach((h, i) => {
    const lower = h.toLowerCase().replace(/[^a-z0-9#]/g, '');
    if (lower.includes('toy') || (lower === '#' && i === 0)) colMap.toyNum = i;
    else if (lower.includes('col') || lower.includes('collector')) colMap.colNum = i;
    else if (lower.includes('model') || lower.includes('name') || lower.includes('casting')) colMap.name = i;
    else if (lower.includes('series') && !lower.includes('#')) colMap.series = i;
    else if (lower.includes('series#') || lower.includes('series #')) colMap.seriesNum = i;
    else if (lower.includes('photo') || lower.includes('image') || lower.includes('pic')) colMap.photo = i;
  });

  if (colMap.name === undefined) {
    if (headers.length >= 2) colMap.name = 1;
    if (headers.length >= 1 && colMap.toyNum === undefined) colMap.toyNum = 0;
  }

  for (const cells of rows) {
    const name = colMap.name !== undefined ? cleanCell(cells[colMap.name] || '') : '';
    if (!name || name.length < 2) continue;
    if (name.startsWith('=') || name.startsWith('{')) continue;

    models.push({
      toy_number: colMap.toyNum !== undefined ? cleanCell(cells[colMap.toyNum] || '') : '',
      collector_number: colMap.colNum !== undefined ? cleanCell(cells[colMap.colNum] || '') : '',
      model_name: name,
      series: colMap.series !== undefined ? cleanCell(cells[colMap.series] || '') : '',
      series_number: colMap.seriesNum !== undefined ? cleanCell(cells[colMap.seriesNum] || '') : '',
      year: year,
      image_filename: colMap.photo !== undefined ? extractImageName(cells[colMap.photo] || '') : '',
      manufacturer: 'Hot Wheels',
      scale: '1:64',
    });
  }
  return models;
}

// ── Main ─────────────────────────────────────────────────────

async function main() {
  console.log(`\nScraping ${YEAR} Hot Wheels from Fandom Wiki...\n`);

  const pageName = `List_of_${YEAR}_Hot_Wheels`;
  const url = `${WIKI_API}?action=parse&page=${pageName}&format=json&prop=wikitext`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.error) {
    console.error('Wiki error:', data.error.info);
    process.exit(1);
  }

  const wikitext = data.parse?.wikitext?.['*'] || '';
  const tables = parseWikiTables(wikitext);
  let allModels = [];

  for (const table of tables) {
    allModels = allModels.concat(mapTableToModels(table, YEAR));
  }

  // Deduplicate
  const seen = new Set();
  const unique = allModels.filter(m => {
    const key = `${m.year}-${m.toy_number}-${m.model_name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`Scraped ${allModels.length} raw -> ${unique.length} unique models for ${YEAR}\n`);

  if (unique.length === 0) {
    console.error('No models found!');
    process.exit(1);
  }

  // Check if 2026 data already exists
  const { count } = await supabase
    .from('hotwheels_catalog')
    .select('*', { count: 'exact', head: true })
    .eq('year', YEAR);

  if (count > 0) {
    console.log(`Found ${count} existing ${YEAR} entries. Deleting before re-import...`);
    const { error: delErr } = await supabase.from('hotwheels_catalog').delete().eq('year', YEAR);
    if (delErr) { console.error('Delete error:', delErr); process.exit(1); }
    console.log('Deleted.\n');
  }

  // Get current max catalog_id so we can assign explicit IDs
  // (the auto-increment sequence may be out of sync after bulk imports)
  const { data: maxRow } = await supabase
    .from('hotwheels_catalog')
    .select('catalog_id')
    .order('catalog_id', { ascending: false })
    .limit(1)
    .single();

  let nextId = (maxRow?.catalog_id ?? 0) + 1;
  console.log(`Next catalog_id: ${nextId}\n`);

  // Assign explicit IDs
  const withIds = unique.map((m, i) => ({ ...m, catalog_id: nextId + i }));

  // Insert in batches
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < withIds.length; i += BATCH) {
    const batch = withIds.slice(i, i + BATCH);
    const { error } = await supabase.from('hotwheels_catalog').insert(batch);
    if (error) {
      console.error(`Batch insert error at ${i}:`, error);
      process.exit(1);
    }
    inserted += batch.length;
    console.log(`  Inserted ${inserted}/${unique.length}`);
  }

  console.log(`\n✓ Done! ${inserted} models for ${YEAR} added to hotwheels_catalog.`);
}

main().catch(console.error);
