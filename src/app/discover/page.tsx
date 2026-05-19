"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useStore } from "@/store/useStore";
import { createClient } from "@/lib/supabase/client";
import {
  Search, Plus, Loader2, ChevronLeft, ChevronRight,
  Bookmark, CheckCircle2, X, Calendar, Layers,
  RotateCcw, Palette, Database, Tag, Hash, Car
} from "lucide-react";
import { toast } from "sonner";

/* ── Types ─────────────────────────────────────────────────── */

interface CatalogModel {
  catalog_id: number;
  toy_number: string;
  collector_number: string;
  model_name: string;
  series: string;
  series_number: string;
  year: number;
  image_filename: string;
  color: string;
  manufacturer: string;
  scale: string;
}

/* ── Constants ─────────────────────────────────────────────── */

const PAGE_SIZE = 40;

const DECADES = [
  { label: "2020s", start: 2020, end: 2025 },
  { label: "2010s", start: 2010, end: 2019 },
  { label: "2000s", start: 2000, end: 2009 },
  { label: "1990s", start: 1990, end: 1999 },
  { label: "1980s", start: 1980, end: 1989 },
  { label: "1970s", start: 1970, end: 1979 },
  { label: "1968–69", start: 1968, end: 1969 },
];

/* ── Helpers ───────────────────────────────────────────────── */

function getPageNumbers(current: number, total: number): (number | "dots")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: (number | "dots")[] = [0];
  if (current > 3) pages.push("dots");
  for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) pages.push(i);
  if (current < total - 4) pages.push("dots");
  pages.push(total - 1);
  return pages;
}

function getColorHex(colorName: string): string | null {
  if (!colorName) return null;
  const lower = colorName.toLowerCase();
  const map: Record<string, string> = {
    red: "#ef4444", blue: "#3b82f6", green: "#22c55e", yellow: "#eab308",
    black: "#374151", white: "#e5e7eb", silver: "#94a3b8", gold: "#d97706",
    orange: "#f97316", purple: "#a855f7", pink: "#ec4899", brown: "#92400e",
    chrome: "#cbd5e1", gray: "#6b7280", grey: "#6b7280", teal: "#14b8a6",
    navy: "#1e3a5f", maroon: "#7f1d1d", copper: "#b87333", lime: "#84cc16",
    aqua: "#06b6d4", tan: "#d2b48c", cream: "#fef3c7", olive: "#65a30d",
    magenta: "#d946ef", turquoise: "#2dd4bf", burgundy: "#881337",
  };
  for (const [key, val] of Object.entries(map)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

/** Safely get Supabase client — returns null during static build */
function getSupabase() {
  try { return createClient(); } catch { return null; }
}

/* ── Page Component ────────────────────────────────────────── */

export default function DiscoverPage() {
  const { addModel, models, user, addISOModel, isoModels } = useStore();
  const gridRef = useRef<HTMLDivElement>(null);

  /* Data state */
  const [catalog, setCatalog] = useState<CatalogModel[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [page, setPage] = useState(0);

  /* Image state */
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [imagesLoading, setImagesLoading] = useState(false);

  /* Filter state */
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDecade, setSelectedDecade] = useState<{ start: number; end: number } | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [seriesFilter, setSeriesFilter] = useState("");
  const [debouncedSeries, setDebouncedSeries] = useState("");
  const [sortBy, setSortBy] = useState("year_desc");

  /* UI state */
  const [selectedModel, setSelectedModel] = useState<CatalogModel | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);

  /* ── Debounced inputs ──────────────────────────────────── */
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchQuery); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSeries(seriesFilter); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [seriesFilter]);

  /* ── Fetch catalog from Supabase ───────────────────────── */
  const fetchCatalog = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) { setIsLoading(false); return; }

    setIsLoading(true);
    try {
      let query = supabase.from("hotwheels_catalog").select("*", { count: "exact" });

      if (debouncedSearch.length >= 2) query = query.ilike("model_name", `%${debouncedSearch}%`);

      if (selectedYear) {
        query = query.eq("year", selectedYear);
      } else if (selectedDecade) {
        query = query.gte("year", selectedDecade.start).lte("year", selectedDecade.end);
      }

      if (debouncedSeries.length >= 2) query = query.ilike("series", `%${debouncedSeries}%`);

      switch (sortBy) {
        case "year_desc": query = query.order("year", { ascending: false }).order("model_name", { ascending: true }); break;
        case "year_asc": query = query.order("year", { ascending: true }).order("model_name", { ascending: true }); break;
        case "name_asc": query = query.order("model_name", { ascending: true }); break;
        case "name_desc": query = query.order("model_name", { ascending: false }); break;
      }

      const from = page * PAGE_SIZE;
      query = query.range(from, from + PAGE_SIZE - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      setCatalog(data || []);
      setTotalCount(count || 0);
      setIsFirstLoad(false);
    } catch (err) {
      console.error("Catalog fetch error:", err);
      toast.error("Failed to load catalog");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedYear, selectedDecade, debouncedSeries, sortBy, page]);

  useEffect(() => { fetchCatalog(); }, [fetchCatalog]);

  /* ── Fetch image URLs from Fandom Wiki ─────────────────── */
  useEffect(() => {
    let cancelled = false;

    async function loadImages() {
      const filenames = catalog
        .map(m => m.image_filename)
        .filter(f => f && f.trim() !== "" && !f.includes("Not Available") && !imageUrls[f]);

      // Deduplicate
      const unique = [...new Set(filenames)];
      if (unique.length === 0) return;

      setImagesLoading(true);
      const newUrls: Record<string, string> = {};
      const BATCH = 45;

      for (let i = 0; i < unique.length; i += BATCH) {
        if (cancelled) break;
        const batch = unique.slice(i, i + BATCH);
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
              newUrls[fname] = info.thumburl || info.url || "";
            }
          }
        } catch (err) {
          console.warn("Image batch fetch failed:", err);
        }
      }

      if (!cancelled) {
        setImageUrls(prev => ({ ...prev, ...newUrls }));
        setImagesLoading(false);
      }
    }

    if (catalog.length > 0) loadImages();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog]);

  /* ── Escape to close modal ─────────────────────────────── */
  useEffect(() => {
    if (!selectedModel) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedModel(null); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [selectedModel]);

  /* ── Collection / ISO helpers ──────────────────────────── */
  const isInCollection = (name: string) => models.some(m => m.name.toLowerCase() === name.toLowerCase());
  const isInISO = (name: string) => isoModels.some(m => m.name.toLowerCase() === name.toLowerCase());

  const handleAdd = async (model: CatalogModel) => {
    if (!user) { toast.error("Sign in to acquire models"); return; }
    setAddingId(model.catalog_id);
    try {
      await addModel({
        name: model.model_name,
        year: String(model.year),
        manufacturer: model.manufacturer || "Hot Wheels",
        series: model.series || "",
        scale: model.scale || "1:64",
        image: imageUrls[model.image_filename] || "",
      });
      toast.success(`${model.model_name} acquired!`);
      if (selectedModel?.catalog_id === model.catalog_id) setSelectedModel(null);
    } catch {
      toast.error("Failed to add");
    } finally {
      setAddingId(null);
    }
  };

  const handleAddISO = async (model: CatalogModel) => {
    if (!user) { toast.error("Sign in to add to wishlist"); return; }
    try {
      await addISOModel({ name: model.model_name, targetprice: "TBD", rarity: "Common" });
      toast.success(`${model.model_name} wishlisted!`);
    } catch (err) {
      console.error("ISO add failed:", err);
      toast.error("Failed to wishlist");
    }
  };

  /* ── Pagination helpers ────────────────────────────────── */
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const changePage = (p: number) => {
    setPage(p);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ── Filter helpers ────────────────────────────────────── */
  const hasFilters = !!searchQuery || !!selectedDecade || !!selectedYear || !!seriesFilter || sortBy !== "year_desc";
  const clearFilters = () => {
    setSearchQuery(""); setSelectedDecade(null); setSelectedYear(null);
    setSeriesFilter(""); setSortBy("year_desc"); setPage(0);
  };

  const decadeYears = selectedDecade
    ? Array.from({ length: selectedDecade.end - selectedDecade.start + 1 }, (_, i) => selectedDecade.end - i)
    : [];

  /* ── Render ────────────────────────────────────────────── */
  return (
    <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1600px] mx-auto w-full min-h-screen">

      {/* ════ Header ════════════════════════════════════════ */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <Database className="text-primary-container" size={20} />
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">Complete Hot Wheels Archive</span>
        </div>
        <h1 className="font-headline text-5xl md:text-8xl font-bold tracking-tighter text-on-surface mb-6 uppercase">
          Discover <span className="text-primary-container">Catalog</span>
        </h1>
        <p className="text-on-surface-variant/70 leading-relaxed max-w-xl text-lg">
          Browse {totalCount > 0 ? totalCount.toLocaleString() : "10,000+"} Hot Wheels models spanning 1968–2025. Search, filter, and add to your collection or wishlist.
        </p>
      </header>

      {/* ════ Filters (always visible) ══════════════════════ */}
      <div className="bg-surface-container-low border border-white/5 p-6 mb-6 space-y-5" ref={gridRef}>

        {/* Search (Case Name) */}
        <div>
          <label className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface/40 mb-2 block">Case Name</label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/30 group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by casting name…"
              aria-label="Search catalog by casting name"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-high border border-white/5 py-3.5 pl-12 pr-10 focus:border-primary-container transition-all outline-none font-body text-sm text-on-surface"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface/30 hover:text-on-surface transition-colors">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Era / Year */}
        <div>
          <label className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface/40 mb-2 block">Year</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedDecade(null); setSelectedYear(null); setPage(0); }}
              className={`px-4 py-2 font-label text-xs uppercase tracking-wider transition-all
                ${!selectedDecade ? "bg-primary-container text-on-primary-container" : "bg-surface-container-high text-on-surface/50 hover:text-on-surface"}`}
            >
              All Eras
            </button>
            {DECADES.map(d => (
              <button
                key={d.label}
                onClick={() => { setSelectedDecade({ start: d.start, end: d.end }); setSelectedYear(null); setPage(0); }}
                className={`px-4 py-2 font-label text-xs uppercase tracking-wider transition-all
                  ${selectedDecade?.start === d.start
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-surface-container-high text-on-surface/50 hover:text-on-surface"
                  }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Individual year chips */}
          {selectedDecade && decadeYears.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => { setSelectedYear(null); setPage(0); }}
                className={`px-3 py-1.5 font-label text-[11px] tracking-wider transition-all border
                  ${!selectedYear ? "bg-primary/20 text-primary border-primary/30" : "bg-surface-container-high text-on-surface/40 hover:text-on-surface border-transparent"}`}
              >
                All
              </button>
              {decadeYears.map(y => (
                <button
                  key={y}
                  onClick={() => { setSelectedYear(y); setPage(0); }}
                  className={`px-3 py-1.5 font-label text-[11px] tracking-wider transition-all border
                    ${selectedYear === y ? "bg-primary/20 text-primary border-primary/30" : "bg-surface-container-high text-on-surface/40 hover:text-on-surface border-transparent"}`}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Series + Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface/40 mb-2 block">Series</label>
            <div className="relative group/s">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/20" size={16} />
              <input
                type="text"
                placeholder="e.g. Mainline, Fast & Furious, Premium…"
                value={seriesFilter}
                onChange={e => setSeriesFilter(e.target.value)}
                className="w-full bg-surface-container-high border border-white/5 py-3 pl-10 pr-4 focus:border-primary-container/50 transition-all outline-none font-body text-sm text-on-surface"
              />
            </div>
          </div>
          <div className="sm:w-56">
            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface/40 mb-2 block">Sort By</label>
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setPage(0); }}
              className="w-full bg-surface-container-high border border-white/5 py-3 px-4 font-body text-sm text-on-surface outline-none focus:border-primary-container/50 cursor-pointer"
            >
              <option value="year_desc">Year (Newest First)</option>
              <option value="year_asc">Year (Oldest First)</option>
              <option value="name_asc">Name (A–Z)</option>
              <option value="name_desc">Name (Z–A)</option>
            </select>
          </div>
        </div>

        {/* Clear */}
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-2 text-primary font-label text-xs uppercase tracking-wider hover:text-primary-container transition-colors">
            <RotateCcw size={14} /> Clear All Filters
          </button>
        )}
      </div>

      {/* ════ Results Summary ═══════════════════════════════ */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <p className="font-body text-sm text-on-surface/40">
          {isLoading ? "Loading…" : totalCount === 0 ? "No results" : (
            <>
              Showing <span className="text-on-surface font-bold">{(page * PAGE_SIZE + 1).toLocaleString()}–{Math.min((page + 1) * PAGE_SIZE, totalCount).toLocaleString()}</span>{" "}
              of <span className="text-on-surface font-bold">{totalCount.toLocaleString()}</span> models
              {(debouncedSearch || selectedDecade || selectedYear || debouncedSeries) && <span className="text-primary ml-2">(filtered)</span>}
            </>
          )}
        </p>
        {totalPages > 1 && !isLoading && (
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface/30">Page {page + 1} / {totalPages}</p>
        )}
      </div>

      {/* ════ Card Grid ═════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {isLoading ? (
          <div className="col-span-full py-32 flex flex-col items-center gap-6">
            <Loader2 className="animate-spin text-primary-container" size={48} />
            <p className="font-label text-sm uppercase tracking-[0.3em] text-on-surface/40 animate-pulse">
              {isFirstLoad ? "Loading Catalog…" : "Updating Results…"}
            </p>
          </div>
        ) : catalog.length === 0 ? (
          <div className="col-span-full py-32 flex flex-col items-center gap-4">
            <Search className="text-on-surface/20" size={48} />
            <p className="font-headline text-xl text-on-surface/40 uppercase">No Models Found</p>
            <p className="font-body text-sm text-on-surface/20">Try adjusting your search or filters</p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-4 px-6 py-3 bg-primary-container text-on-primary-container font-label text-xs uppercase tracking-wider hover:brightness-110 transition-all">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          catalog.map(model => {
            const inCollection = isInCollection(model.model_name);
            const inISO = isInISO(model.model_name);
            const isAdding = addingId === model.catalog_id;
            const imgUrl = imageUrls[model.image_filename] || "";
            const colorHex = getColorHex(model.color);

            return (
              <article
                key={model.catalog_id}
                onClick={() => setSelectedModel(model)}
                className="bg-surface-container-low group hover:bg-surface-container transition-all duration-300 border border-white/5 hover:border-white/10 cursor-pointer flex flex-col relative overflow-hidden"
              >
                {/* ── Image ── */}
                <div className="aspect-[4/3] relative overflow-hidden bg-[#080808] flex items-center justify-center">
                  {imgUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imgUrl}
                      alt={model.model_name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full">
                      {imagesLoading ? (
                        <div className="w-8 h-8 border-2 border-on-surface/10 border-t-primary/30 rounded-full animate-spin" />
                      ) : (
                        <Car size={36} className="text-on-surface/10" />
                      )}
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-60 pointer-events-none" />

                  {/* Year badge */}
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-on-surface font-headline text-[11px] font-bold px-2.5 py-1 tracking-wider z-10">
                    {model.year}
                  </div>

                  {/* Status badges */}
                  {inCollection && (
                    <div className="absolute top-3 left-3 bg-primary-container/90 backdrop-blur-sm text-white px-2.5 py-1 flex items-center gap-1.5 z-10">
                      <CheckCircle2 size={11} />
                      <span className="font-label text-[8px] font-bold uppercase tracking-wider">In Vault</span>
                    </div>
                  )}
                  {!inCollection && inISO && (
                    <div className="absolute top-3 left-3 bg-secondary-container/90 backdrop-blur-sm text-white px-2.5 py-1 flex items-center gap-1.5 z-10">
                      <Bookmark size={11} fill="white" />
                      <span className="font-label text-[8px] font-bold uppercase tracking-wider">ISO</span>
                    </div>
                  )}

                  {/* Collector number */}
                  {model.collector_number && (
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-on-surface/50 font-headline text-[10px] font-bold px-2 py-1 z-10 border border-white/5 tracking-widest">
                      #{model.collector_number}
                    </div>
                  )}
                </div>

                {/* ── Text Content ── */}
                <div className="p-4 flex-grow flex flex-col border-t border-white/5">
                  <h3 className="font-headline text-sm font-black text-on-surface uppercase leading-tight line-clamp-2 min-h-[2.5rem] mb-2 group-hover:text-primary transition-colors">
                    {model.model_name}
                  </h3>

                  {model.series && (
                    <div className="flex items-center gap-1.5 text-primary/70 mb-1">
                      <Layers size={11} className="shrink-0" />
                      <span className="font-label text-[10px] tracking-wider uppercase truncate font-bold">{model.series}</span>
                      {model.series_number && <span className="font-label text-[9px] text-on-surface/25 shrink-0">({model.series_number})</span>}
                    </div>
                  )}

                  {model.color && colorHex && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-2.5 h-2.5 rounded-full border border-white/10 shrink-0" style={{ background: colorHex }} />
                      <span className="font-body text-[10px] text-on-surface/30 truncate">{model.color}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-1.5 mt-auto pt-3">
                    <button
                      onClick={e => { e.stopPropagation(); handleAdd(model); }}
                      disabled={inCollection || isAdding || !user}
                      className={`flex-grow py-2.5 flex items-center justify-center gap-1.5 font-headline text-[9px] font-black tracking-[0.15em] uppercase transition-all duration-300
                        ${inCollection
                          ? "bg-surface-container-highest text-on-surface/20 cursor-default"
                          : "bg-primary-container text-on-primary-container hover:bg-white hover:text-black active:scale-95"
                        }`}
                    >
                      {isAdding ? <Loader2 size={12} className="animate-spin" /> : inCollection ? "Secured" : <><Plus size={12} /> Acquire</>}
                    </button>
                    {!inCollection && (
                      <button
                        onClick={e => { e.stopPropagation(); handleAddISO(model); }}
                        disabled={inISO || !user}
                        title={inISO ? "Already wishlisted" : "Add to Wishlist"}
                        className={`p-2.5 transition-all duration-300
                          ${inISO
                            ? "bg-surface-container-highest text-primary/40 cursor-default"
                            : "bg-surface-container-high text-on-surface/40 hover:text-primary hover:bg-white"
                          }`}
                      >
                        <Bookmark size={14} fill={inISO ? "currentColor" : "none"} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* ════ Pagination ════════════════════════════════════ */}
      {!isLoading && totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-2 flex-wrap" aria-label="Catalog pagination">
          <button
            onClick={() => changePage(0)}
            disabled={page === 0}
            className="px-3 py-2 bg-surface-container border border-white/5 text-on-surface/40 hover:text-on-surface disabled:opacity-20 disabled:cursor-default transition-all font-label text-[10px] uppercase tracking-wider hidden sm:block"
          >
            First
          </button>
          <button
            onClick={() => changePage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="p-2.5 bg-surface-container border border-white/5 text-on-surface/50 hover:text-on-surface disabled:opacity-20 disabled:cursor-default transition-all"
          >
            <ChevronLeft size={18} />
          </button>

          {getPageNumbers(page, totalPages).map((p, i) =>
            p === "dots" ? (
              <span key={`dots-${i}`} className="px-2 text-on-surface/20 font-body select-none">…</span>
            ) : (
              <button
                key={p}
                onClick={() => changePage(p as number)}
                className={`w-10 h-10 font-label text-xs transition-all
                  ${page === p
                    ? "bg-primary-container text-on-primary-container font-bold"
                    : "bg-surface-container border border-white/5 text-on-surface/40 hover:text-on-surface hover:border-white/20"
                  }`}
              >
                {(p as number) + 1}
              </button>
            )
          )}

          <button
            onClick={() => changePage(Math.min(totalPages - 1, page + 1))}
            disabled={page === totalPages - 1}
            className="p-2.5 bg-surface-container border border-white/5 text-on-surface/50 hover:text-on-surface disabled:opacity-20 disabled:cursor-default transition-all"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => changePage(totalPages - 1)}
            disabled={page === totalPages - 1}
            className="px-3 py-2 bg-surface-container border border-white/5 text-on-surface/40 hover:text-on-surface disabled:opacity-20 disabled:cursor-default transition-all font-label text-[10px] uppercase tracking-wider hidden sm:block"
          >
            Last
          </button>
        </nav>
      )}

      {/* ════ Detail Modal ══════════════════════════════════ */}
      {selectedModel && (() => {
        const inCollection = isInCollection(selectedModel.model_name);
        const inISO = isInISO(selectedModel.model_name);
        const colorHex = getColorHex(selectedModel.color);
        const isAdding = addingId === selectedModel.catalog_id;
        const modalImg = imageUrls[selectedModel.image_filename] || "";

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-background/95 backdrop-blur-2xl" onClick={() => setSelectedModel(null)} />

            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="catalog-modal-title"
              className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-surface-container-low border border-white/10 shadow-2xl flex flex-col md:flex-row"
            >
              {/* Left — Image */}
              <div className="w-full md:w-[55%] aspect-square md:aspect-auto relative bg-[#030303] flex items-center justify-center p-8 group/img shrink-0">
                {modalImg ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={modalImg}
                    alt={selectedModel.model_name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain transition-transform duration-700 group-hover/img:scale-105"
                  />
                ) : (
                  <Car size={80} className="text-on-surface/10" />
                )}
              </div>

              {/* Right — Details */}
              <div className="w-full md:w-[45%] p-8 md:p-10 flex flex-col border-l border-white/5 bg-gradient-to-br from-surface-container-low to-background">
                {/* Close */}
                <button
                  onClick={() => setSelectedModel(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-surface-bright transition-all text-on-surface/20 hover:text-on-surface z-20"
                >
                  <X size={24} />
                </button>

                {/* Series label */}
                {selectedModel.series && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-[2px] w-10 bg-primary" />
                    <span className="font-label text-[11px] uppercase tracking-[0.4em] text-primary font-bold">{selectedModel.series}</span>
                  </div>
                )}

                {/* Model name */}
                <h2 id="catalog-modal-title" className="font-headline text-3xl md:text-4xl font-black text-on-surface tracking-tighter uppercase leading-[0.9] mb-8 pr-10">
                  {selectedModel.model_name}
                </h2>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <InfoCell label="Year" value={String(selectedModel.year)} icon={<Calendar size={13} />} />
                  {selectedModel.toy_number && <InfoCell label="Toy Number" value={selectedModel.toy_number} icon={<Hash size={13} />} />}
                  {selectedModel.collector_number && <InfoCell label="Collector #" value={selectedModel.collector_number} icon={<Tag size={13} />} />}
                  {selectedModel.series_number && <InfoCell label="Series #" value={selectedModel.series_number} icon={<Layers size={13} />} />}
                  {selectedModel.color && (
                    <div className="bg-surface-container p-3 border border-white/5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Palette size={13} className="text-on-surface/30" />
                        <span className="font-label text-[9px] uppercase tracking-[0.15em] text-on-surface/30">Color</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {colorHex && <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ background: colorHex }} />}
                        <span className="font-headline text-base font-bold text-on-surface">{selectedModel.color}</span>
                      </div>
                    </div>
                  )}
                  <InfoCell label="Scale" value={selectedModel.scale || "1:64"} icon={<Car size={13} />} />
                </div>

                {/* Actions */}
                <div className="mt-auto flex flex-col gap-3">
                  <button
                    onClick={() => handleAdd(selectedModel)}
                    disabled={inCollection || isAdding || !user}
                    className={`w-full py-5 flex items-center justify-center gap-3 font-headline text-sm font-black tracking-[0.3em] uppercase transition-all duration-500
                      ${inCollection
                        ? "bg-surface-container-highest text-on-surface/20 cursor-default"
                        : "bg-primary-container text-on-primary-container hover:bg-white hover:text-black active:scale-[0.98] shadow-2xl"
                      }`}
                  >
                    {isAdding ? <Loader2 size={20} className="animate-spin" /> : inCollection ? "Secured in Vault" : <><Plus size={20} /> Acquire Casting</>}
                  </button>

                  {!inCollection && (
                    <button
                      onClick={() => handleAddISO(selectedModel)}
                      disabled={inISO || !user}
                      className={`w-full py-3.5 flex items-center justify-center gap-2 border font-headline text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300
                        ${inISO
                          ? "border-white/5 text-on-surface/15 cursor-default"
                          : "border-white/15 text-on-surface/50 hover:bg-white hover:text-black hover:border-white"
                        }`}
                    >
                      <Bookmark size={16} fill={inISO ? "currentColor" : "none"} />
                      {inISO ? "On Wishlist" : "Add to Wishlist"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
}

/* ── Small helper component ────────────────────────────────── */

function InfoCell({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-surface-container p-3 border border-white/5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-on-surface/30">{icon}</span>
        <span className="font-label text-[9px] uppercase tracking-[0.15em] text-on-surface/30">{label}</span>
      </div>
      <span className="font-headline text-base font-bold text-on-surface">{value}</span>
    </div>
  );
}
