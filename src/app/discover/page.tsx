"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useStore } from "@/store/useStore";
import { createClient } from "@/lib/supabase/client";
import {
  Search, Plus, Loader2, ChevronLeft, ChevronRight,
  Bookmark, CheckCircle2, X, Calendar, Layers,
  Sparkles, SlidersHorizontal, RotateCcw, Palette,
  Database, Tag, Hash, Car
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

const PAGE_SIZE = 48;

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

/* ── Detail Cell Component ─────────────────────────────────── */

function DetailCell({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-surface-container p-4 border border-white/5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-on-surface/30">{icon}</span>
        <span className="font-label text-[9px] uppercase tracking-[0.15em] text-on-surface/30">{label}</span>
      </div>
      <span className="font-headline text-lg font-bold text-on-surface">{value}</span>
    </div>
  );
}

/* ── Page Component ────────────────────────────────────────── */

/** Safely get Supabase client – returns null when env vars are missing (e.g. during static build) */
function getSupabase() {
  try {
    return createClient();
  } catch {
    return null;
  }
}

export default function DiscoverPage() {
  const { addModel, models, user, addISOModel, isoModels } = useStore();
  const gridRef = useRef<HTMLDivElement>(null);

  /* Data state */
  const [catalog, setCatalog] = useState<CatalogModel[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [page, setPage] = useState(0);

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
  const [showFilters, setShowFilters] = useState(false);

  /* ── Debounced search ──────────────────────────────────── */
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

      // Search filter
      if (debouncedSearch.length >= 2) {
        query = query.ilike("model_name", `%${debouncedSearch}%`);
      }

      // Year / Decade filter
      if (selectedYear) {
        query = query.eq("year", selectedYear);
      } else if (selectedDecade) {
        query = query.gte("year", selectedDecade.start).lte("year", selectedDecade.end);
      }

      // Series filter
      if (debouncedSeries.length >= 2) {
        query = query.ilike("series", `%${debouncedSeries}%`);
      }

      // Sort
      switch (sortBy) {
        case "year_desc":
          query = query.order("year", { ascending: false }).order("model_name", { ascending: true });
          break;
        case "year_asc":
          query = query.order("year", { ascending: true }).order("model_name", { ascending: true });
          break;
        case "name_asc":
          query = query.order("model_name", { ascending: true });
          break;
        case "name_desc":
          query = query.order("model_name", { ascending: false });
          break;
      }

      // Pagination
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

  /* ── Escape key to close modal ─────────────────────────── */
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
        image: "",
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
      await addISOModel({ name: model.model_name, targetPrice: "TBD", rarity: "Standard" });
      toast.success(`${model.model_name} wishlisted!`);
    } catch {
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
    setSearchQuery("");
    setSelectedDecade(null);
    setSelectedYear(null);
    setSeriesFilter("");
    setSortBy("year_desc");
    setPage(0);
  };

  const decadeYears = selectedDecade
    ? Array.from({ length: selectedDecade.end - selectedDecade.start + 1 }, (_, i) => selectedDecade.end - i)
    : [];

  /* ── Render ────────────────────────────────────────────── */
  return (
    <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1600px] mx-auto w-full min-h-screen">

      {/* ════ Header ════════════════════════════════════════ */}
      <header className="mb-12">
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

      {/* ════ Search + Filter Toggle ════════════════════════ */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6" ref={gridRef}>
        <div className="relative flex-grow group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/30 group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by model name…"
            aria-label="Search catalog by model name"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container border border-white/5 py-4 pl-14 pr-4 focus:border-primary-container transition-all outline-none font-body text-base text-on-surface"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface/30 hover:text-on-surface transition-colors">
              <X size={18} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className={`flex items-center gap-2 px-6 py-4 border font-label text-xs uppercase tracking-widest transition-all shrink-0
            ${showFilters
              ? "bg-primary-container text-on-primary-container border-primary-container"
              : "bg-surface-container text-on-surface/60 border-white/5 hover:border-white/20"
            }`}
        >
          <SlidersHorizontal size={16} />
          Filters
          {hasFilters && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
        </button>
      </div>

      {/* ════ Filter Panel ══════════════════════════════════ */}
      {showFilters && (
        <div className="bg-surface-container-low border border-white/5 p-6 mb-6 space-y-6">

          {/* Decade Chips */}
          <div>
            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface/40 mb-3 block">Era</label>
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
          </div>

          {/* Year Chips (within selected decade) */}
          {selectedDecade && decadeYears.length > 0 && (
            <div>
              <label className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface/40 mb-3 block">Year</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setSelectedYear(null); setPage(0); }}
                  className={`px-3 py-1.5 font-label text-[11px] tracking-wider transition-all border
                    ${!selectedYear
                      ? "bg-primary/20 text-primary border-primary/30"
                      : "bg-surface-container-high text-on-surface/40 hover:text-on-surface border-transparent"
                    }`}
                >
                  All
                </button>
                {decadeYears.map(y => (
                  <button
                    key={y}
                    onClick={() => { setSelectedYear(y); setPage(0); }}
                    className={`px-3 py-1.5 font-label text-[11px] tracking-wider transition-all border
                      ${selectedYear === y
                        ? "bg-primary/20 text-primary border-primary/30"
                        : "bg-surface-container-high text-on-surface/40 hover:text-on-surface border-transparent"
                      }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Series + Sort Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <label className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface/40 mb-2 block">Series</label>
              <div className="relative group/series">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/20" size={16} />
                <input
                  type="text"
                  placeholder="Filter by series name…"
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

          {/* Clear Filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 text-primary font-label text-xs uppercase tracking-wider hover:text-primary-container transition-colors"
            >
              <RotateCcw size={14} /> Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* ════ Results Summary Bar ═══════════════════════════ */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
        <p className="font-body text-sm text-on-surface/40">
          {isLoading ? (
            "Loading…"
          ) : totalCount === 0 ? (
            "No results"
          ) : (
            <>
              Showing{" "}
              <span className="text-on-surface font-bold">
                {(page * PAGE_SIZE + 1).toLocaleString()}–{Math.min((page + 1) * PAGE_SIZE, totalCount).toLocaleString()}
              </span>{" "}
              of <span className="text-on-surface font-bold">{totalCount.toLocaleString()}</span> models
              {(debouncedSearch || selectedDecade || selectedYear || debouncedSeries) && (
                <span className="text-primary ml-2">(filtered)</span>
              )}
            </>
          )}
        </p>
        {totalPages > 1 && !isLoading && (
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface/30">
            Page {page + 1} / {totalPages}
          </p>
        )}
      </div>

      {/* ════ Card Grid ═════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-3 bg-primary-container text-on-primary-container font-label text-xs uppercase tracking-wider hover:brightness-110 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          catalog.map(model => {
            const inCollection = isInCollection(model.model_name);
            const inISO = isInISO(model.model_name);
            const isAdding = addingId === model.catalog_id;
            const colorHex = getColorHex(model.color);

            return (
              <article
                key={model.catalog_id}
                onClick={() => setSelectedModel(model)}
                className="bg-surface-container-low group hover:bg-surface-container transition-all duration-300 border border-white/5 hover:border-white/10 cursor-pointer flex flex-col relative overflow-hidden"
              >
                {/* Color accent bar */}
                <div className="h-1 w-full" style={{ background: colorHex || "var(--color-surface-container-highest)" }} />

                {/* Header — faint year + status badges */}
                <div className="px-5 pt-5 pb-2 flex items-start justify-between">
                  <span className="font-headline text-[42px] font-black text-on-surface/[0.06] leading-none select-none">{model.year}</span>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {inCollection && (
                      <span className="bg-primary-container/90 text-white px-2 py-0.5 flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        <span className="font-label text-[8px] font-bold uppercase tracking-wider">Owned</span>
                      </span>
                    )}
                    {!inCollection && inISO && (
                      <span className="bg-secondary-container/90 text-white px-2 py-0.5 flex items-center gap-1">
                        <Bookmark size={10} fill="white" />
                        <span className="font-label text-[8px] font-bold uppercase tracking-wider">ISO</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Model name */}
                <div className="px-5 pb-3">
                  <h3 className="font-headline text-sm font-black text-on-surface uppercase leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                    {model.model_name}
                  </h3>
                </div>

                {/* Details */}
                <div className="px-5 pb-4 flex-grow space-y-2">
                  {model.series && (
                    <div className="flex items-center gap-1.5 text-on-surface/40">
                      <Layers size={11} className="shrink-0" />
                      <span className="font-body text-[11px] truncate">{model.series}</span>
                      {model.series_number && (
                        <span className="font-label text-[10px] text-on-surface/25 shrink-0">({model.series_number})</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-label text-[10px] text-on-surface/30 uppercase tracking-wider">{model.year}</span>
                    {model.toy_number && (
                      <span className="font-label text-[10px] text-on-surface/25">#{model.toy_number}</span>
                    )}
                    {model.color && colorHex && (
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full border border-white/10 shrink-0" style={{ background: colorHex }} />
                        <span className="font-label text-[10px] text-on-surface/25 truncate max-w-[80px]">{model.color}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-3 pb-3 flex gap-1.5 mt-auto">
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

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-background/95 backdrop-blur-2xl" onClick={() => setSelectedModel(null)} />

            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="catalog-modal-title"
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-container-low border border-white/10 shadow-2xl"
            >
              {/* Top accent bar */}
              <div className="h-1.5 w-full sticky top-0 z-10" style={{ background: colorHex || "var(--color-primary-container)" }} />

              <div className="p-8 sm:p-12">
                {/* Close button */}
                <button
                  onClick={() => setSelectedModel(null)}
                  className="absolute top-6 right-6 p-2 hover:bg-surface-bright transition-all text-on-surface/20 hover:text-on-surface z-20"
                >
                  <X size={24} />
                </button>

                {/* Series label */}
                {selectedModel.series && (
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-[2px] w-10 bg-primary" />
                    <span className="font-label text-[11px] uppercase tracking-[0.4em] text-primary font-bold">{selectedModel.series}</span>
                  </div>
                )}

                {/* Model name */}
                <h2
                  id="catalog-modal-title"
                  className="font-headline text-4xl sm:text-5xl font-black text-on-surface tracking-tighter uppercase leading-[0.9] mb-10 pr-12"
                >
                  {selectedModel.model_name}
                </h2>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
                  <DetailCell label="Year" value={String(selectedModel.year)} icon={<Calendar size={14} />} />
                  {selectedModel.toy_number && (
                    <DetailCell label="Toy Number" value={selectedModel.toy_number} icon={<Hash size={14} />} />
                  )}
                  {selectedModel.collector_number && (
                    <DetailCell label="Collector #" value={selectedModel.collector_number} icon={<Tag size={14} />} />
                  )}
                  {selectedModel.series_number && (
                    <DetailCell label="Series #" value={selectedModel.series_number} icon={<Layers size={14} />} />
                  )}
                  {selectedModel.color && (
                    <div className="bg-surface-container p-4 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Palette size={14} className="text-on-surface/30" />
                        <span className="font-label text-[9px] uppercase tracking-[0.15em] text-on-surface/30">Color</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {colorHex && (
                          <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ background: colorHex }} />
                        )}
                        <span className="font-headline text-lg font-bold text-on-surface">{selectedModel.color}</span>
                      </div>
                    </div>
                  )}
                  <DetailCell label="Scale" value={selectedModel.scale || "1:64"} icon={<Car size={14} />} />
                  <DetailCell label="Manufacturer" value={selectedModel.manufacturer || "Hot Wheels"} icon={<Sparkles size={14} />} />
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleAdd(selectedModel)}
                    disabled={inCollection || isAdding || !user}
                    className={`w-full py-5 flex items-center justify-center gap-3 font-headline text-sm font-black tracking-[0.3em] uppercase transition-all duration-500
                      ${inCollection
                        ? "bg-surface-container-highest text-on-surface/20 cursor-default"
                        : "bg-primary-container text-on-primary-container hover:bg-white hover:text-black active:scale-[0.98] shadow-2xl"
                      }`}
                  >
                    {isAdding
                      ? <Loader2 size={20} className="animate-spin" />
                      : inCollection
                        ? "Secured in Vault"
                        : <><Plus size={20} /> Acquire Casting</>
                    }
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
