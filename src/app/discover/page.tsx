"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import Image from "next/image";
import { Search, Plus, Sparkles, CheckCircle2, Loader2 } from "lucide-react";

// Curated list of iconic Hot Wheels models for discovery
const DISCOVERY_DATABASE = [
  { name: "Nissan Skyline GT-R (R34)", year: "2024", series: "HW J-Imports", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxiGdEMZf3Ut9pLh9-TKLtf7y5aYyQLjWIw6FcJbmyd4X_e6K2vPB5n2F1T4ctT4gxSTX-0XL4N3BVtkXSUzPTe19hpfPIv-r7WBrrgEMQymtbKEJr31V6xJeTYiGhhwssvKqgaegOJcsG1riZevR45Se8Hcxt2Unte9lieOm7Ny7j4dfaJvh0VjnAfNq8xTIOPnWjaoG6_yRyKRzvIWJPmezwzq45vVTGtClQrcj44VxJQv0bn8DYfL0u6qurW5NSDZDYVAUIojA" },
  { name: "Porsche 911 GT3", year: "2023", series: "HW Exotics", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsyaT9nUD71dH4BSf0cj5J8W6G1rrmlzwB9O64MjTnXGRseNSrKIPRynHs2bm1ybmRJXqs9tCinOmCRnh4GUjVUD1914Pgovy_Tz4wTfIu0EAZZvKxSAlzPyY1Au-c8P58wM6jiePC8RFCCs5CFqaMfWDFFC9Y3IXTIVnz5UH1pELwuoOMkeVT3u-DZAUTYGwWZTj48UVB4Ouen-9UwFObvf2XoXyLR-1-EoWv2KtxAGEF2Y40EdrB4-tUVIe5b2hgzVIXwwvvIRU" },
  { name: "Toyota Supra (A80)", year: "2024", series: "Then and Now", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDppfkRoAsfgcg0D7syBeH8l0FyVDZi-r3PTr3p1FiOz_7MLCQfcWhE1vTpSs0_mJ_KrLIXxQRQJFcJuMogaeAiCt2yV7L00NT3EEfT7kNaux3QkjiUbFtq7FK3gBl3PP9RqRl06UNsgrWUkHJw-2Wm5jaW7-pUoVJfih7fAuuVRni-SZbsRKAyA8S7rCtFwDrFX3617zuLteW4QKjmIytIUmMpEi92OGWGjZabzOfDkE_Cn8mQe1OXfKBYEEsPpHqHziIxkvQoe1w" },
  { name: "Lamborghini Countach LP500 S", year: "2022", series: "HW Tooned", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPJ-o_lDNvdfita_Vt9CQyM5ZYagHA_bbOiG_2TMtwFNicPFK1AmToaa3mI8W_Bg4nuF7QmWtb_sGPlnzIXYvCj4V1bqjcgwVzjPHtnOmj8ZND_M0daiDqrEunfae5nF8KVgpoUhdnliZPpTyKoDLRoziqZIz_t6l3610GGtNn42EOJfYsOq1sO_v93nwEICxBn4k6taRVUVpg0ocU6x_4KldcGZPN96-vO3US2goOfEXoikOu1FxuHH6ZZzz2snt3ZpX0lrul4bc" },
  { name: "Mazda RX-7", year: "2024", series: "HW Drift", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAopkQgVBICaNlEl6GB5VdxoNMYAelF9X93fcuanC1g8RQ5fVzZ3tA_JYDgwQKXpi9P5ZMsC0hwiVjg4wvIISXb2IfzBcssdfg5hG7on0KbmvP86ITt78dUsIDuWGoMAAO3XTguSI_11uJPCVHhqbeXeZoHU_pnEzr0YKB8wMh-r-9XLFSIHmZNvsg8wuR5nX0hbhS6BT3sNRcIbphQ7vF4AlNkphzHa8WduocMhgnG2_l04jqImHOPEDfzXKl6MMmEJSzDHS3lcEo" },
  { name: "Ford Mustang Mach-E 1400", year: "2023", series: "HW Green Speed", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCR8cdG4oFA0L-K-wB7m6T2-OKG55Jcn1YPsrlt_YyO3TmlNVui9ddJV8koZetj4Cdn2h4g4z2uaIvNkfDYRst81uk2dVG8k_DR8kqMqahYqgeR0Ee8r3cNxymICAgNK4XlmBL7VLvJubyt6CdqKV8O6ghyCW27_AWw7Oc1RoaNxL3PyIHlapcv9V2HuSGIeZon4EjdFv9sa6tsPWwuQCxhOhCXlP2MJoTP-WKB-y2baPuH0hj8LsBCWIu-Qs0DncTVrMSh8tCFeCs" },
  { name: "Batmobile (The Batman)", year: "2022", series: "Batman", image: "https://lh3.googleusercontent.com/aida-public/batmobile_1776684743669.png" },
  { name: "Dodge Charger Drift Car", year: "2024", series: "HW Rescue", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxiGdEMZf3Ut9pLh9-TKLtf7y5aYyQLjWIw6FcJbmyd4X_e6K2vPB5n2F1T4ctT4gxSTX-0XL4N3BVtkXSUzPTe19hpfPIv-r7WBrrgEMQymtbKEJr31V6xJeTYiGhhwssvKqgaegOJcsG1riZevR45Se8Hcxt2Unte9lieOm7Ny7j4dfaJvh0VjnAfNq8xTIOPnWjaoG6_yRyKRzvIWJPmezwzq45vVTGtClQrcj44VxJQv0bn8DYfL0u6qurW5NSDZDYVAUIojA" }
];

export default function DiscoverPage() {
  const { addModel, models, user } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);

  const filteredModels = useMemo(() => {
    return DISCOVERY_DATABASE.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.series.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const isAlreadyInCollection = (name: string) => {
    return models.some(m => m.name.toLowerCase() === name.toLowerCase());
  };

  const handleAdd = async (model: typeof DISCOVERY_DATABASE[0]) => {
    if (!user) return;
    setAddingId(model.name);
    
    await addModel({
      name: model.name,
      year: model.year,
      manufacturer: "Hot Wheels",
      series: model.series,
      scale: "1:64",
      image: model.image
    });

    setAddingId(null);
  };

  return (
    <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto w-full min-h-screen">
      {/* Header Section */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-primary-container" size={20} />
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">Global Archive</span>
          </div>
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter text-on-surface mb-6 uppercase">
            Discover <span className="text-primary-container">Castings</span>
          </h1>
          <p className="text-on-surface-variant/70 leading-relaxed max-w-lg">
            Explore the definitive Hot Wheels database. Uncover legendary silhouettes and instantly append them to your private digital museum.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search by casting or series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container border-b-2 border-outline-variant/20 py-4 pl-12 pr-6 focus:border-primary transition-all outline-none font-body text-sm"
          />
        </div>
      </header>

      {/* Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredModels.map((item, index) => {
          const inCollection = isAlreadyInCollection(item.name);
          const isAdding = addingId === item.name;

          return (
            <article 
              key={index}
              className="bg-surface-container-low group hover:bg-surface-container transition-all duration-500 border border-white/5 relative overflow-hidden"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-black/40">
                <Image 
                  fill
                  alt={item.name}
                  src={item.image}
                  className="object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60"></div>
                
                {inCollection && (
                  <div className="absolute top-4 left-4 bg-primary-container/90 backdrop-blur-md text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xl">
                    <CheckCircle2 size={12} />
                    <span className="font-label text-[9px] font-bold uppercase tracking-wider">In Collection</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-label text-[9px] tracking-widest text-primary-container uppercase font-bold">{item.series}</span>
                  <span className="font-label text-[9px] tracking-widest text-on-surface/40 uppercase font-bold">{item.year}</span>
                </div>
                <h3 className="font-headline text-lg font-bold text-on-surface uppercase mb-6 line-clamp-1">{item.name}</h3>
                
                <button 
                  onClick={() => handleAdd(item)}
                  disabled={inCollection || isAdding || !user}
                  className={`w-full py-3 flex items-center justify-center gap-2 font-headline text-[10px] font-bold tracking-widest uppercase transition-all duration-300
                    ${inCollection 
                      ? 'bg-surface-container-highest text-on-surface/30 cursor-default' 
                      : 'bg-primary-container text-on-primary-container hover:bg-primary hover:text-white active:scale-95'
                    }
                    ${!user ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {isAdding ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : inCollection ? (
                    'Owned'
                  ) : (
                    <>
                      <Plus size={14} />
                      Acquire
                    </>
                  )}
                </button>
              </div>
            </article>
          );
        })}

        {filteredModels.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-on-surface/40 font-body italic text-lg">No legendary castings found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </main>
  );
}
