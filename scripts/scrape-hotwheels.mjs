/**
 * Hot Wheels Fandom Wiki Scraper
 * Scrapes the complete Hot Wheels catalog (1968-2025) from the Fandom Wiki API
 * Outputs a JSON file ready for Supabase import
 *
 * Usage: node scripts/scrape-hotwheels.mjs
 */

import fs from 'fs';
import path from 'path';

const WIKI_API = 'https://hotwheels.fandom.com/api.php';
const START_YEAR = 1968;
const END_YEAR = 2025;
const OUTPUT_FILE = path.join(process.cwd(), 'scripts', 'hotwheels-catalog.json');
const DELAY_MS = 1500; // Be respectful to the wiki server

// ── Helpers ──────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Strip wiki table cell attributes: bgcolor="...", style="..." etc. before the pipe */
function stripCellAttributes(cell) {
  if (!cell) return '';
  // Pattern: bgcolor="value" | content  (one or more attributes)
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

/** Strip wiki markup: [[Page|Display]] → Display, [[Page]] → Page */
function cleanWikiLink(text) {
  if (!text) return '';
  // Remove [[File:...]] and [[Image:...]] references
  text = text.replace(/\[\[(File|Image):[^\]]*\]\]/gi, '');
  // Convert [[Page|Display]] to Display
  text = text.replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2');
  // Convert [[Page]] to Page
  text = text.replace(/\[\[([^\]]*)\]\]/g, '$1');
  return text;
}

/** Remove HTML tags, wiki bold/italic, and trim */
function cleanText(text) {
  if (!text) return '';
  text = text.replace(/<br\s*\/?>/gi, ' '); // <br> → space
  text = text.replace(/<[^>]+>/g, '');       // strip all HTML tags
  text = text.replace(/'{2,3}/g, '');        // strip wiki bold/italic
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/​/g, '');        // zero-width space
  return text.trim();
}

/** Full clean pipeline: attributes → templates → wiki links → HTML/text → normalize spaces */
function cleanCell(raw) {
  let result = cleanText(cleanWikiLink(stripWikiTemplates(stripCellAttributes(raw))));
  // Collapse multiple spaces left by template removal
  result = result.replace(/\s{2,}/g, ' ').trim();
  return result;
}

/** Extract image filename from [[File:name.jpg|...]] or [[Image:name.jpg|...]] */
function extractImageName(text) {
  if (!text) return '';
  const match = text.match(/\[\[(File|Image):([^|\]]+)/i);
  if (match) {
    return match[2].trim();
  }
  return '';
}

/** Build a Fandom wiki image URL from filename */
function buildImageUrl(filename) {
  if (!filename) return '';
  // Fandom uses a hash-based path: /images/X/XX/filename
  // We'll store just the filename and construct URLs client-side or use a proxy
  return filename;
}

// ── Wiki Table Parser ─────────────────────────────────────────

function parseWikiTables(wikitext) {
  const tables = [];
  // Match table blocks: {| ... |}
  const tableRegex = /\{\|[^\n]*\n([\s\S]*?)\n\|\}/g;
  let match;

  while ((match = tableRegex.exec(wikitext)) !== null) {
    const tableContent = match[1];
    const rows = tableContent.split(/\n\|\-\s*/);

    let headers = [];
    const dataRows = [];

    for (const row of rows) {
      const lines = row.split('\n').filter(l => l.trim());

      // Check if this row contains headers (lines starting with !)
      const headerLine = lines.find(l => l.trim().startsWith('!'));
      if (headerLine) {
        // Parse header cells - split by !! or \n!
        const fullHeader = lines
          .filter(l => l.trim().startsWith('!'))
          .map(l => l.replace(/^\s*!\s*/, ''))
          .join('!!');
        headers = fullHeader.split(/!!/).map(h => cleanCell(h));
        continue;
      }

      // Fallback: detect "bold header" rows used in 1997-era pages
      // e.g.  | bgcolor="#C0C0C0"| '''Toy #'''  (pipe-separated cells with bold text)
      if (headers.length === 0) {
        const cellLines = lines.filter(l => l.trim().startsWith('|'));
        const boldCells = cellLines.filter(l => /'''.+'''/.test(l));
        if (boldCells.length >= 3 && boldCells.length === cellLines.length) {
          // All cells are bold — treat as header row
          const fullRow = cellLines.map(l => l.replace(/^\s*\|\s*/, '')).join('||');
          const cells = fullRow.split(/\|\|/).map(c => c.trim());
          headers = cells.map(h => cleanCell(h));
          continue;
        }
      }

      // Parse data cells
      const cellLines = lines.filter(l => l.trim().startsWith('|'));
      if (cellLines.length === 0) continue;

      // Join all cell lines and split by ||
      const fullRow = cellLines.map(l => l.replace(/^\s*\|\s*/, '')).join('||');
      const cells = fullRow.split(/\|\|/).map(c => c.trim());

      if (cells.length >= 2) {
        dataRows.push(cells);
      }
    }

    if (headers.length > 0 && dataRows.length > 0) {
      tables.push({ headers, rows: dataRows });
    }
  }

  return tables;
}

// ── Template Row Parser (1997-era pages) ─────────────────────

/**
 * Split template parameters by | but respect [[...]] wiki links
 * which may contain their own | characters.
 */
function splitTemplateParams(text) {
  const params = [];
  let current = '';
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '[' && text[i + 1] === '[') { depth++; current += '[['; i++; continue; }
    if (text[i] === ']' && text[i + 1] === ']') { depth = Math.max(0, depth - 1); current += ']]'; i++; continue; }
    if (text[i] === '|' && depth === 0) { params.push(current); current = ''; continue; }
    current += text[i];
  }
  if (current) params.push(current);
  return params;
}

/**
 * Parse {{List0000White|...}} and similar template-based row formats
 * used on some late-1990s / early-2000s wiki pages.
 * Returns models extracted from template rows in the wikitext.
 */
function parseTemplateRows(wikitext, year) {
  const models = [];
  // Match templates like {{List0000White|toy|col|name|series|series#|}}
  // Template names vary: List0000White, Listblack, ListC0C0C0, etc.
  const templateRegex = /\{\{List[A-Fa-f0-9]*(?:White|Black|Red|Blue|Green|Yellow|Gray|Grey|C0C0C0)?[^|]*\|([\s\S]*?)\}\}/gi;
  let match;

  while ((match = templateRegex.exec(wikitext)) !== null) {
    const params = splitTemplateParams(match[1]);
    if (params.length < 3) continue;

    const toyNum = cleanCell(params[0] || '');
    const colNum = cleanCell(params[1] || '');
    const name = cleanCell(params[2] || '');
    const series = cleanCell(params[3] || '');
    const seriesNum = cleanCell(params[4] || '');

    if (!name || name.length < 2) continue;
    if (name.startsWith('=') || name.startsWith('{')) continue;

    // Try to find the image that follows this template in the text
    const matchEnd = match.index + match[0].length;
    const afterMatch = wikitext.substring(matchEnd, matchEnd + 200);
    const imageFile = extractImageName(afterMatch);

    models.push({
      toy_number: toyNum,
      collector_number: colNum,
      model_name: name,
      series: series,
      series_number: seriesNum,
      year: year,
      image_filename: imageFile,
      color: '',
      manufacturer: 'Hot Wheels',
      scale: '1:64',
    });
  }

  return models;
}

/** Map table rows to model objects based on detected headers */
function mapTableToModels(table, year) {
  const { headers, rows } = table;
  const models = [];

  // Detect column indices by header name patterns
  const colMap = {};
  headers.forEach((h, i) => {
    const lower = h.toLowerCase().replace(/[^a-z0-9#]/g, '');
    if (lower.includes('toy') || (lower === '#' && i === 0)) colMap.toyNum = i;
    else if (lower.includes('col') || lower.includes('collector')) colMap.colNum = i;
    else if (lower.includes('model') || lower.includes('name') || lower.includes('casting')) colMap.name = i;
    else if (lower.includes('series') && !lower.includes('#')) colMap.series = i;
    else if (lower.includes('series#') || lower.includes('series #')) colMap.seriesNum = i;
    else if (lower.includes('photo') || lower.includes('image') || lower.includes('pic')) colMap.photo = i;
    else if (lower.includes('color') || lower.includes('colour')) colMap.color = i;
  });

  // If no name column found, try second column (common in older formats)
  if (colMap.name === undefined) {
    if (headers.length >= 2) colMap.name = 1;
    if (headers.length >= 1 && colMap.toyNum === undefined) colMap.toyNum = 0;
  }

  for (const cells of rows) {
    const name = colMap.name !== undefined ? cleanCell(cells[colMap.name] || '') : '';
    if (!name || name.length < 2) continue;

    // Skip section header rows (e.g., "=== Series Name ===")
    if (name.startsWith('=') || name.startsWith('{')) continue;

    const toyNum = colMap.toyNum !== undefined ? cleanCell(cells[colMap.toyNum] || '') : '';
    const colNum = colMap.colNum !== undefined ? cleanCell(cells[colMap.colNum] || '') : '';
    const series = colMap.series !== undefined ? cleanCell(cells[colMap.series] || '') : '';
    const seriesNum = colMap.seriesNum !== undefined ? cleanCell(cells[colMap.seriesNum] || '') : '';
    const photoRaw = colMap.photo !== undefined ? cells[colMap.photo] || '' : '';
    const imageFile = extractImageName(photoRaw);
    const color = colMap.color !== undefined ? cleanCell(cells[colMap.color] || '') : '';

    models.push({
      toy_number: toyNum,
      collector_number: colNum,
      model_name: name,
      series: series,
      series_number: seriesNum,
      year: year,
      image_filename: imageFile,
      color: color,
      manufacturer: 'Hot Wheels',
      scale: '1:64',
    });
  }

  return models;
}

// ── Main Scraper ──────────────────────────────────────────────

async function fetchYearData(year) {
  const pageName = `List_of_${year}_Hot_Wheels`;
  const url = `${WIKI_API}?action=parse&page=${pageName}&format=json&prop=wikitext`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`  ⚠ HTTP ${response.status} for ${year}`);
      return [];
    }

    const data = await response.json();

    if (data.error) {
      console.warn(`  ⚠ Wiki error for ${year}: ${data.error.info}`);
      return [];
    }

    const wikitext = data.parse?.wikitext?.['*'] || '';
    if (!wikitext) {
      console.warn(`  ⚠ No wikitext for ${year}`);
      return [];
    }

    const tables = parseWikiTables(wikitext);
    let allModels = [];

    for (const table of tables) {
      const models = mapTableToModels(table, year);
      allModels = allModels.concat(models);
    }

    // Fallback: parse template-based rows (used in late 1990s / early 2000s pages)
    if (allModels.length === 0) {
      const templateModels = parseTemplateRows(wikitext, year);
      if (templateModels.length > 0) {
        console.log(`(template parser: ${templateModels.length}) `);
        allModels = templateModels;
      }
    }

    return allModels;
  } catch (err) {
    console.error(`  ✗ Error fetching ${year}:`, err.message);
    return [];
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  HOT WHEELS FANDOM WIKI SCRAPER');
  console.log(`  Scraping years ${START_YEAR}–${END_YEAR}`);
  console.log('═══════════════════════════════════════════════\n');

  let allModels = [];

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    process.stdout.write(`  ${year}... `);
    const models = await fetchYearData(year);
    console.log(`${models.length} models`);
    allModels = allModels.concat(models);
    await sleep(DELAY_MS);
  }

  // Deduplicate by toy_number + year + model_name
  const seen = new Set();
  const unique = allModels.filter(m => {
    const key = `${m.year}-${m.toy_number}-${m.model_name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Add unique IDs
  const catalog = unique.map((m, i) => ({
    catalog_id: i + 1,
    ...m,
  }));

  console.log(`\n═══════════════════════════════════════════════`);
  console.log(`  Total: ${allModels.length} raw → ${catalog.length} unique models`);
  console.log(`  Output: ${OUTPUT_FILE}`);
  console.log(`═══════════════════════════════════════════════`);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(catalog, null, 2));
  console.log('\n✓ Done! Run the Supabase seed script next.');
}

main().catch(console.error);
