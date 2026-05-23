"use client";

import { useState } from "react";
import { useCollectionStore, Model } from "@/store/useCollectionStore";
import { Heart, Trash2, BadgeCheck, MapPin, Tag, ImageOff } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

interface ResolvedImagePair {
  url: string;      // full-resolution URL
  thumburl: string;  // thumbnail URL (scale-to-width-down/400)
}

interface ModelCardProps {
  model: Model;
  /** Freshly-resolved image URLs from Fandom API */
  resolvedImage?: ResolvedImagePair;
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

/** Detect Fandom CDN's placeholder images (valid image data, HTTP 200) */
function isFandomPlaceholder(img: HTMLImageElement): boolean {
  const isTiny = img.naturalWidth < 150 || img.naturalHeight < 150;
  const is300x171 = img.naturalWidth === 300 && img.naturalHeight === 171;
  return isTiny || is300x171;
}

function ImagePlaceholder() {
  return (
    <div className="w-full h-full bg-surface-container-highest flex flex-col items-center justify-center gap-2">
      <ImageOff size={32} className="text-on-surface/15" />
      <span className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface/25">Image not Available</span>
    </div>
  );
}

export default function ModelCard({ model, resolvedImage }: ModelCardProps) {
  const { toggleFavorite, removeModel } = useCollectionStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  // Track which URL variant we're currently trying
  const [urlAttempt, setUrlAttempt] = useState<"thumb" | "full" | "stored">("thumb");

  // Build the list of URLs to try in order:
  //  1. thumburl (smaller, faster) — may return 300×171 placeholder
  //  2. full url (larger, reliable) — may return 300×171 placeholder for different images
  //  3. stored model.image (original URL from when model was added)
  function getCurrentImageUrl(): string {
    if (resolvedImage) {
      if (urlAttempt === "thumb" && resolvedImage.thumburl) return resolvedImage.thumburl;
      if (urlAttempt === "full" && resolvedImage.url) return resolvedImage.url;
    }
    // "stored" or no resolved image available
    return model.image || "";
  }

  const displayImage = getCurrentImageUrl();

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    if (isFandomPlaceholder(img)) {
      // Current URL returned a placeholder — try the next variant
      if (urlAttempt === "thumb" && resolvedImage?.url) {
        setUrlAttempt("full");
      } else if (urlAttempt === "full" && model.image) {
        setUrlAttempt("stored");
      } else {
        // All variants exhausted
        setImgFailed(true);
      }
    }
  };

  const handleImageError = () => {
    // Network/404 error — try next variant
    if (urlAttempt === "thumb" && resolvedImage?.url) {
      setUrlAttempt("full");
    } else if (urlAttempt === "full" && model.image) {
      setUrlAttempt("stored");
    } else {
      setImgFailed(true);
    }
  };

  const seriesDisplay = cleanSeries(model.series);

  return (
    <>
      <article className="group bg-surface-container-low rounded-xl overflow-hidden transition-all duration-300 hover:translate-y-[-4px] flex flex-col h-full border border-white/5">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-lowest shrink-0">
          {displayImage && !imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={displayImage}
              src={displayImage}
              alt={model.name}
              onError={handleImageError}
              onLoad={handleImageLoad}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <ImagePlaceholder />
          )}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              onClick={() => toggleFavorite(model.id)}
              aria-label={model.isFavorite ? `Unfavorite ${model.name}` : `Favorite ${model.name}`}
              className={`p-2 bg-background/60 backdrop-blur-md rounded-full transition-colors ${model.isFavorite ? 'text-primary' : 'text-on-surface hover:text-primary'}`}
            >
               <Heart size={18} fill={model.isFavorite ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Museum Condition Tag */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-2">
            {model.condition && (
              <span className="bg-primary-container/90 backdrop-blur-md text-on-primary-container font-label text-[8px] px-2 py-0.5 tracking-widest uppercase font-bold shadow-lg">
                {model.condition}
              </span>
            )}
          </div>

          {seriesDisplay && (
            <div className="absolute bottom-4 left-4 z-10">
              <span className="bg-surface-bright text-on-surface font-label text-[10px] px-2 py-1 tracking-wider uppercase">
                {seriesDisplay}
              </span>
            </div>
          )}
        </div>

        <div className="p-6 flex-grow flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-headline text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">{model.name}</h3>
              <p className="text-on-surface/60 text-sm font-label uppercase tracking-widest">{model.year} • {model.manufacturer}</p>
            </div>
            <span className="font-headline font-bold text-lg text-primary">{model.scale}</span>
          </div>

          {/* Hobby Metrics */}
          <div className="flex flex-wrap gap-3 mb-6">
            {model.purchase_price !== undefined && model.purchase_price !== null && (
              <div className="flex items-center gap-1.5 text-on-surface/40">
                <Tag size={12} className="text-primary-container" />
                <span className="font-label text-[10px] uppercase tracking-tighter">₹{Number(model.purchase_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {model.storage_location && (
              <div className="flex items-center gap-1.5 text-on-surface/40">
                <MapPin size={12} className="text-primary-container" />
                <span className="font-label text-[10px] uppercase tracking-tighter">{model.storage_location}</span>
              </div>
            )}
            {model.grade && (
              <div className="flex items-center gap-1.5 text-on-surface/40 border-l border-white/10 pl-3">
                <span className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface/60">GRADE: {model.grade}</span>
              </div>
            )}
          </div>

          <div className="pt-4 mt-auto flex items-center justify-between border-t border-outline-variant/15">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              aria-label={`Remove ${model.name} from collection`}
              className="text-[10px] font-label uppercase tracking-[0.15em] text-on-surface/40 hover:text-error transition-colors flex items-center gap-1 group/btn"
            >
              <Trash2 size={14} />
              Remove
            </button>
            <BadgeCheck size={20} className="text-on-surface/20" />
          </div>
        </div>
      </article>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Remove Model"
        message={`Are you sure you want to remove "${model.name}" from your collection? This action cannot be undone.`}
        confirmLabel="Remove"
        onConfirm={() => {
          removeModel(model.id);
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
