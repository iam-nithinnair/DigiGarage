import { create } from 'zustand';

export interface Model {
  id: string;
  name: string;
  year: string;
  manufacturer: string;
  series: string;
  scale: string;
  isFavorite: boolean;
  image: string;
}

export interface ISOModel {
  id: string;
  name: string;
  targetPrice: string;
  rarity: string;
}

interface CollectionState {
  models: Model[];
  isoModels: ISOModel[];
  addModel: (model: Omit<Model, 'id' | 'isFavorite'>) => void;
  removeModel: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addISOModel: (model: Omit<ISOModel, 'id'>) => void;
  removeISOModel: (id: string) => void;
}

export const useStore = create<CollectionState>((set) => ({
  models: [
    {
      id: '1',
      name: '1967 Ford Mustang GT',
      year: '1967',
      manufacturer: 'AUTOart',
      series: 'Die-Cast',
      scale: '1:18',
      isFavorite: false,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCR8cdG4oFA0L-K-wB7m6T2-OKG55Jcn1YPsrlt_YyO3TmlNVui9ddJV8koZetj4Cdn2h4g4z2uaIvNkfDYRst81uk2dVG8k_DR8kqMqahYqgeR0Ee8r3cNxymICAgNK4XlmBL7VLvJubyt6CdqKV8O6ghyCW27_AWw7Oc1RoaNxL3PyIHlapcv9V2HuSGIeZon4EjdFv9sa6tsPWwuQCxhOhCXlP2MJoTP-WKB-y2baPuH0hj8LsBCWIu-Qs0DncTVrMSh8tCFeCs"
    },
    {
      id: '2',
      name: '2022 Porsche 911 GT3',
      year: '2022',
      manufacturer: 'Spark',
      series: 'Resin',
      scale: '1:43',
      isFavorite: true,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsyaT9nUD71dH4BSf0cj5J8W6G1rrmlzwB9O64MjTnXGRseNSrKIPRynHs2bm1ybmRJXqs9tCinOmCRnh4GUjVUD1914Pgovy_Tz4wTfIu0EAZZvKxSAlzPyY1Au-c8P58wM6jiePC8RFCCs5CFqaMfWDFFC9Y3IXTIVnz5UH1pELwuoOMkeVT3u-DZAUTYGwWZTj48UVB4Ouen-9UwFObvf2XoXyLR-1-EoWv2KtxAGEF2Y40EdrB4-tUVIe5b2hgzVIXwwvvIRU"
    },
    {
      id: '3',
      name: 'Ferrari F40',
      year: '1987',
      manufacturer: 'Kyosho',
      series: 'Composite',
      scale: '1:12',
      isFavorite: false,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKtzzHuhaTuR_BtYJyQP1bhJ4olqeCSviAMySIy2k5j1d7e1bIVwgn2eBw_vIyU3R_MOXvlUHt0BLnEJBn4NCHjuVKhDRG3f7Gz3TkdlLjv_9w4CDb82Jds9fcgl8ythiAYTQbtDQRYtK-gt2147KQ7XPNoTVVUCkfX8Hjrwv_AcpUAcMNKSP_abtSaVtlGnleL6sB1-VraTvyarP90ZeFQpthVBNSJxtzLcucKM0wdJ7-yGikyejVd5m9HBHWv3182xK6sPE_QLA"
    },
    {
      id: '4',
      name: 'Lamborghini Countach',
      year: '1974',
      manufacturer: 'BBR',
      series: 'Die-Cast',
      scale: '1:18',
      isFavorite: false,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPJ-o_lDNvdfita_Vt9CQyM5ZYagHA_bbOiG_2TMtwFNicPFK1AmToaa3mI8W_Bg4nuF7QmWtb_sGPlnzIXYvCj4V1bqjcgwVzjPHtnOmj8ZND_M0daiDqrEunfae5nF8KVgpoUhdnliZPpTyKoDLRoziqZIz_t6l3610GGtNn42EOJfYsOq1sO_v93nwEICxBn4k6taRVUVpg0ocU6x_4KldcGZPN96-vO3US2goOfEXoikOu1FxuHH6ZZzz2snt3ZpX0lrul4bc"
    }
  ],
  isoModels: [
    {
      id: '1',
      name: 'Nissan Skyline GT-R R34 (Nismo)',
      targetPrice: '$250',
      rarity: 'Ultra-Rare'
    },
    {
      id: '2',
      name: 'McLaren F1 GTR',
      targetPrice: '$400',
      rarity: 'Legendary'
    }
  ],
  addModel: (model) => set((state) => ({ models: [...state.models, { ...model, id: Date.now().toString(), isFavorite: false }] })),
  removeModel: (id) => set((state) => ({ models: state.models.filter(m => m.id !== id) })),
  toggleFavorite: (id) => set((state) => ({
    models: state.models.map(m => m.id === id ? { ...m, isFavorite: !m.isFavorite } : m)
  })),
  addISOModel: (model) => set((state) => ({ isoModels: [...state.isoModels, { ...model, id: Date.now().toString() }] })),
  removeISOModel: (id) => set((state) => ({ isoModels: state.isoModels.filter(m => m.id !== id) }))
}));
