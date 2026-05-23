"use client";

import { useState, useEffect, useRef } from "react";
import { useCollectionStore } from "@/store/useCollectionStore";
import ModelCard from "@/components/ModelCard";
import AddModal from "@/components/AddModal";
import AuthGuard from "@/components/AuthGuard";
import { Plus, ChevronDown } from "lucide-react";

/** Extract image filename from a Fandom CDN URL */
function extractFandomFilename(url: string): string | null {
  if (!url) return null;
  // Match: /images/{hash1}/{hash2}/{filename}/revision/ or just /{filename}.ext
  const match = url.match(/\/([^/]+\.(?:jpg|jpeg|png|gif|webp))(?:\/|$)/i);
  return match ? decodeURIComponent(match[1]) : null;
}

/** Check if a URL is a Fandom CDN image URL */
function isFandomUrl(url: string): boolean {
  if (!url) return false;
  return url.includes("static.wikia.nocookie.net") || url.includes("fandom.com");
}

/** Strip wiki markup artifacts from series names stored in user collections */
function cleanSeries(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/\{\{[^}]*\}\}/g, "")              // {{NM|2025}}, {{KR}}, etc.
    .replace(/bgcolor="[^"]*"\s*\|?\s*/gi, "")   // bgcolor="#32CD32" |
    .replace(/\[\[[^\]]*\|([^\]]*)\]\]/g, "$1")  // [[Link|Text]] → Text
    .replace(/\[\[([^\]]*)\]\]/g, "$1")           // [[Text]] → Text
    .replace(/'''?/g, "")                          // bold/italic wiki markup
    .replace(/\}\}+/g, "")                        // orphaned closing braces
    .replace(/\{\{+/g, "")                        // orphaned opening braces
    .replace(/\s{2,}/g, " ")
    .trim()
    .replace(/^\d+$/, "");                         // pure numbers are artifacts, not series names
}

export default function CollectionPage() {
  const models = useCollectionStore(state => state.models);
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const [sortParam, setSortParam] = useState("Name: A-Z");
  const [seriesFilter, setSeriesFilter] = useState<string[]>([]);
  const [manFilter, setManFilter] = useState<string[]>([]);

  /** Map of model.id → freshly resolved Fandom image URLs (full + thumb) */
  const [resolvedImages, setResolvedImages] = useState<Record<string, { url: string; thumburl: string }>>({});
  const resolvedRef = useRef<Set<string>>(new Set());

  /* ── Re-resolve stale Fandom CDN URLs via Wiki API ─────── */
  useEffect(() => {
    let cancelled = false;

    async function resolveImages() {
      // Collect models whose stored image is a Fandom URL and hasn't been resolved yet
      const toResolve: { id: string; filename: string }[] = [];
      for (const m of models) {
        if (resolvedRef.current.has(m.id)) continue;   // already resolved
        if (!isFandomUrl(m.image)) continue;            // not a Fandom URL
        const fname = extractFandomFilename(m.image);
        if (!fname) continue;
        toResolve.push({ id: m.id, filename: fname });
      }

      if (toResolve.length === 0) return;

      // Deduplicate filenames (multiple models may share the same image)
      const filenameToIds = new Map<string, string[]>();
      for (const { id, filename } of toResolve) {
        const ids = filenameToIds.get(filename) || [];
        ids.push(id);
        filenameToIds.set(filename, ids);
      }

      const uniqueFilenames = Array.from(filenameToIds.keys());
      const newUrls: Record<string, { url: string; thumburl: string }> = {};
      const BATCH = 45;

      for (let i = 0; i < uniqueFilenames.length; i += BATCH) {
        if (cancelled) break;
        const batch = uniqueFilenames.slice(i, i + BATCH);
        const titles = batch.map(f => `File:${f}`).join("|");

        try {
          const res = await fetch(
            `https://hotwheels.fandom.com/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=400&titles=${encodeURIComponent(titles)}`
          );
          const data = await res.json();
          const pages = data.query?.pages || {};

          for (const pg of Object.values(pages) as any[]) {
            const info = pg.imageinfo?.[0];
            if (info) {
              const fname = pg.title.replace(/^File:/, "");
              const pair = {
                url: info.url || "",
                thumburl: info.thumburl || "",
              };
              // Map back to all model IDs that use this filename
              const ids = filenameToIds.get(fname) || [];
              for (const id of ids) {
                newUrls[id] = pair;
              }
            }
          }
        } catch (err) {
          console.warn("Fandom image batch resolve failed:", err);
        }
      }

      if (!cancelled) {
        // Mark all attempted models as resolved (even if no URL came back)
        for (const { id } of toResolve) {
          resolvedRef.current.add(id);
        }
        setResolvedImages(prev => ({ ...prev, ...newUrls }));
      }
    }

    if (models.length > 0) resolveImages();
    return () => { cancelled = true; };
  }, [models]);

  // Sorting and Filtering logic
  let displayedModels = [...models];

  if (seriesFilter.length > 0) {
    displayedModels = displayedModels.filter(m => seriesFilter.includes(m.series));
  }

  if (manFilter.length > 0) {
    displayedModels = displayedModels.filter(m => manFilter.includes(m.manufacturer));
  }

  displayedModels.sort((a, b) => {
    switch(sortParam) {
      case "Year: Newest First":
        return Number(b.year) - Number(a.year);
      case "Year: Oldest First":
        return Number(a.year) - Number(b.year);
      case "Name: Z-A":
        return b.name.localeCompare(a.name);
      case "Name: A-Z":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const toggleSeries = (s: string) => {
    setSeriesFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const toggleMan = (m: string) => {
    setManFilter(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  // Dynamic series from actual data — deduplicate on cleaned names
  const seriesMap = new Map<string, string>(); // cleaned → raw (first occurrence)
  models.forEach(m => {
    if (!m.series) return;
    const cleaned = cleanSeries(m.series);
    if (cleaned && !seriesMap.has(cleaned)) seriesMap.set(cleaned, m.series);
  });
  const allSeries = Array.from(seriesMap.entries()); // [cleaned, raw][]

  return (
    <AuthGuard>
    <main className="pb-24 px-8 max-w-[1440px] mx-auto w-full">
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 pt-12">
        <div>
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-2 block">Archive Overview</span>
          <h1 className="text-5xl md:text-6xl font-headline font-bold tracking-tighter text-on-surface">My Collection</h1>
        </div>
        <button onClick={() => setAddModalOpen(true)} className="bg-primary-container text-on-primary-container font-headline font-bold px-8 py-4 flex items-center gap-2 hover:brightness-110 transition-all duration-200 active:scale-95 group">
          <Plus size={20} />
          ADD TO COLLECTION
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Filter Sidebar */}
        <aside className="w-full lg:w-64 space-y-10 shrink-0">
          <div>
            <h3 className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/40 mb-6">Sort By</h3>
            <div className="relative">
              <select value={sortParam} onChange={(e) => setSortParam(e.target.value)} className="w-full bg-surface-container-lowest border-b-2 border-outline-variant/15 text-on-surface font-headline py-3 px-0 focus:border-primary-container focus:ring-0 appearance-none cursor-pointer">
                <option>Name: A-Z</option>
                <option>Name: Z-A</option>
                <option>Year: Newest First</option>
                <option>Year: Oldest First</option>
              </select>
              <ChevronDown size={20} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface/40" />
            </div>
          </div>
          
          <div>
            <h3 className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/40 mb-6">Series</h3>
            <div className="space-y-3">
              {allSeries.map(([cleaned, raw]) => (
                <label key={raw} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={seriesFilter.includes(raw)} onChange={() => toggleSeries(raw)} className="w-5 h-5 bg-surface-container-high border-none text-primary-container rounded-sm focus:ring-offset-background" />
                  <span className="font-headline text-sm group-hover:text-primary transition-colors">{cleaned}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/40 mb-6">Manufacturer</h3>
            <div className="space-y-3">
              {Array.from(new Set(models.map(m => m.manufacturer))).map(m => (
                <label key={m} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={manFilter.includes(m)} onChange={() => toggleMan(m)} className="w-5 h-5 bg-surface-container-high border-none text-primary-container rounded-sm focus:ring-offset-background" />
                  <span className="font-headline text-sm group-hover:text-primary transition-colors">{m}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Collection Grid */}
        <section className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {displayedModels.map(model => (
              <ModelCard key={model.id} model={model} resolvedImage={resolvedImages[model.id]} />
            ))}
            {displayedModels.length === 0 && (
              <div className="col-span-full pt-10 text-on-surface/50 font-body text-center">No models found for these filters.</div>
            )}
          </div>
        </section>
      </div>

      <AddModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} />
    </main>
    </AuthGuard>
  );
}
