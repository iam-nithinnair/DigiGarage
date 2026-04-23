"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import Image from "next/image";
import { Search, Plus, Sparkles, CheckCircle2, Loader2, Filter } from "lucide-react";

// Expanded database of 2024-2025 Hot Wheels models
const DISCOVERY_DATABASE = [
  // 2024-2025 Highlights
  { name: "Mazda Autozam", year: "2024", series: "HW Dream Garage", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxiGdEMZf3Ut9pLh9-TKLtf7y5aYyQLjWIw6FcJbmyd4X_e6K2vPB5n2F1T4ctT4gxSTX-0XL4N3BVtkXSUzPTe19hpfPIv-r7WBrrgEMQymtbKEJr31V6xJeTYiGhhwssvKqgaegOJcsG1riZevR45Se8Hcxt2Unte9lieOm7Ny7j4dfaJvh0VjnAfNq8xTIOPnWjaoG6_yRyKRzvIWJPmezwzq45vVTGtClQrcj44VxJQv0bn8DYfL0u6qurW5NSDZDYVAUIojA" },
  { name: "Tesla Cybertruck", year: "2024", series: "HW Rolling Metal", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCR8cdG4oFA0L-K-wB7m6T2-OKG55Jcn1YPsrlt_YyO3TmlNVui9ddJV8koZetj4Cdn2h4g4z2uaIvNkfDYRst81uk2dVG8k_DR8kqMqahYqgeR0Ee8r3cNxymICAgNK4XlmBL7VLvJubyt6CdqKV8O6ghyCW27_AWw7Oc1RoaNxL3PyIHlapcv9V2HuSGIeZon4EjdFv9sa6tsPWwuQCxhOhCXlP2MJoTP-WKB-y2baPuH0hj8LsBCWIu-Qs0DncTVrMSh8tCFeCs" },
  { name: "McLaren F1", year: "2024", series: "HW: The '90s", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAopkQgVBICaNlEl6GB5VdxoNMYAelF9X93fcuanC1g8RQ5fVzZ3tA_JYDgwQKXpi9P5ZMsC0hwiVjg4wvIISXb2IfzBcssdfg5hG7on0KbmvP86ITt78dUsIDuWGoMAAO3XTguSI_11uJPCVHhqbeXeZoHU_pnEzr0YKB8wMh-r-9XLFSIHmZNvsg8wuR5nX0hbhS6BT3sNRcIbphQ7vF4AlNkphzHa8WduocMhgnG2_l04jqImHOPEDfzXKl6MMmEJSzDHS3lcEo" },
  { name: "Porsche 911 Rallye", year: "2024", series: "HW Turbo", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsyaT9nUD71dH4BSf0cj5J8W6G1rrmlzwB9O64MjTnXGRseNSrKIPRynHs2bm1ybmRJXqs9tCinOmCRnh4GUjVUD1914Pgovy_Tz4wTfIu0EAZZvKxSAlzPyY1Au-c8P58wM6jiePC8RFCCs5CFqaMfWDFFC9Y3IXTIVnz5UH1pELwuoOMkeVT3u-DZAUTYGwWZTj48UVB4Ouen-9UwFObvf2XoXyLR-1-EoWv2KtxAGEF2Y40EdrB4-tUVIe5b2hgzVIXwwvvIRU" },
  { name: "Gordon Murray Automotive T.50S", year: "2024", series: "HW Exotics", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDppfkRoAsfgcg0D7syBeH8l0FyVDZi-r3PTr3p1FiOz_7MLCQfcWhE1vTpSs0_mJ_KrLIXxQRQJFcJuMogaeAiCt2yV7L00NT3EEfT7kNaux3QkjiUbFtq7FK3gBl3PP9RqRl06UNsgrWUkHJw-2Wm5jaW7-pUoVJfih7fAuuVRni-SZbsRKAyA8S7rCtFwDrFX3617zuLteW4QKjmIytIUmMpEi92OGWGjZabzOfDkE_Cn8mQe1OXfKBYEEsPpHqHziIxkvQoe1w" },
  { name: "Koenigsegg Jesko", year: "2024", series: "HW Exotics", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPJ-o_lDNvdfita_Vt9CQyM5ZYagHA_bbOiG_2TMtwFNicPFK1AmToaa3mI8W_Bg4nuF7QmWtb_sGPlnzIXYvCj4V1bqjcgwVzjPHtnOmj8ZND_M0daiDqrEunfae5nF8KVgpoUhdnliZPpTyKoDLRoziqZIz_t6l3610GGtNn42EOJfYsOq1sO_v93nwEICxBn4k6taRVUVpg0ocU6x_4KldcGZPN96-vO3US2goOfEXoikOu1FxuHH6ZZzz2snt3ZpX0lrul4bc" },
  { name: "Batmobile (The Batman)", year: "2024", series: "Batman", image: "/cars/batmobile_1776684743669.png" },
  { name: "U.S.S. Enterprise NCC-1701", year: "2024", series: "HW Screen Time", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdQhVtGwaiP0cwO6TO7noyJO7zIUwFZIqAik1uJTOpfBWe5kqW3NWA8ZwenfMCckCBiG8Dq5f1Nu4YhiSm3tP11rErZrDDX2dAi6XvL0B1Sg5I43shH4zYxvSn48lboD6ySTUcGSC68bhKofG3oJx_HcrW7sN0m6R8y5YxT1sUgh6_0HsZuPTqSmtqQ8VfcYkzbxZlYfGxg1cS7l8RLCKtsj1G3FdX_37fjeQBEsPyy58nlGqexauGsRADOfgTkPSJ7BEn9ByDDSo" },
  { name: "Dodge Charger SRT", year: "2024", series: "HW First Response", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBejTqFREqoc73fY6hdevf54cFdor7OfZE451XCMDg_Cb5NlURyEGWnoovsyAPPPeWJqOliEfKCbp2Owtpadding-mt5okpDeBcAqMW3KCeqh6LIz4n-8W9_w96nOqWosiluzukzwjqLv6MDbRq4hftWIHN65he4QhOKYVcPnKQ5ZtIc6bpqlhQBLdI1__BanJYj-Hr-NZmzA5r5sYqR_APtNpq3n3fxet0lD4Hz52otKlclxkVJ-FuDYp48E2sn0IlsG0DiRtIaaFt8SvMMs" },
  { name: "'89 Mercedes-Benz 560 SEC AMG", year: "2024", series: "HW Modified", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXT6eLfqcnXudqCOf6cTBTABnCzBsxAELj_dQ2RO343BbUtE5whoGAWUTGonYGeAFG8T6sajWTHlIWoNCt-wnIo4Ocnols0PMHQG9JgC59M_Z2rgoF3daV19TO3wnFSOK3EdA6lBoj3T0zREhDdAPvf5CssuYWVrhZOI5LqUVxlpc7G3-Pw7Wr94clKqMnY-PZ77LXzzzI6O028Z6HJVABZT7Qbq_bs0ER1J7phiAPTwTONGpDXXrlgpmzKbPfP5KqVglejrjGHSI" },
  
  // Iconic J-Imports
  { name: "Honda Civic EF", year: "2024", series: "HW J-Imports", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxiGdEMZf3Ut9pLh9-TKLtf7y5aYyQLjWIw6FcJbmyd4X_e6K2vPB5n2F1T4ctT4gxSTX-0XL4N3BVtkXSUzPTe19hpfPIv-r7WBrrgEMQymtbKEJr31V6xJeTYiGhhwssvKqgaegOJcsG1riZevR45Se8Hcxt2Unte9lieOm7Ny7j4dfaJvh0VjnAfNq8xTIOPnWjaoG6_yRyKRzvIWJPmezwzq45vVTGtClQrcj44VxJQv0bn8DYfL0u6qurW5NSDZDYVAUIojA" },
  { name: "Toyota Van", year: "2024", series: "HW J-Imports", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCR8cdG4oFA0L-K-wB7m6T2-OKG55Jcn1YPsrlt_YyO3TmlNVui9ddJV8koZetj4Cdn2h4g4z2uaIvNkfDYRst81uk2dVG8k_DR8kqMqahYqgeR0Ee8r3cNxymICAgNK4XlmBL7VLvJubyt6CdqKV8O6ghyCW27_AWw7Oc1RoaNxL3PyIHlapcv9V2HuSGIeZon4EjdFv9sa6tsPWwuQCxhOhCXlP2MJoTP-WKB-y2baPuH0hj8LsBCWIu-Qs0DncTVrMSh8tCFeCs" },
  { name: "Nissan Skyline GT-R (R32)", year: "2023", series: "HW J-Imports", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAopkQgVBICaNlEl6GB5VdxoNMYAelF9X93fcuanC1g8RQ5fVzZ3tA_JYDgwQKXpi9P5ZMsC0hwiVjg4wvIISXb2IfzBcssdfg5hG7on0KbmvP86ITt78dUsIDuWGoMAAO3XTguSI_11uJPCVHhqbeXeZoHU_pnEzr0YKB8wMh-r-9XLFSIHmZNvsg8wuR5nX0hbhS6BT3sNRcIbphQ7vF4AlNkphzHa8WduocMhgnG2_l04jqImHOPEDfzXKl6MMmEJSzDHS3lcEo" },
  { name: "Mazda RX-7 FD", year: "2024", series: "HW Drift", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsyaT9nUD71dH4BSf0cj5J8W6G1rrmlzwB9O64MjTnXGRseNSrKIPRynHs2bm1ybmRJXqs9tCinOmCRnh4GUjVUD1914Pgovy_Tz4wTfIu0EAZZvKxSAlzPyY1Au-c8P58wM6jiePC8RFCCs5CFqaMfWDFFC9Y3IXTIVnz5UH1pELwuoOMkeVT3u-DZAUTYGwWZTj48UVB4Ouen-9UwFObvf2XoXyLR-1-EoWv2KtxAGEF2Y40EdrB4-tUVIe5b2hgzVIXwwvvIRU" },
  
  // Supercars & Exotics
  { name: "Lamborghini Sian FKP 37", year: "2023", series: "HW Exotics", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDppfkRoAsfgcg0D7syBeH8l0FyVDZi-r3PTr3p1FiOz_7MLCQfcWhE1vTpSs0_mJ_KrLIXxQRQJFcJuMogaeAiCt2yV7L00NT3EEfT7kNaux3QkjiUbFtq7FK3gBl3PP9RqRl06UNsgrWUkHJw-2Wm5jaW7-pUoVJfih7fAuuVRni-SZbsRKAyA8S7rCtFwDrFX3617zuLteW4QKjmIytIUmMpEi92OGWGjZabzOfDkE_Cn8mQe1OXfKBYEEsPpHqHziIxkvQoe1w" },
  { name: "Bugatti Bolide", year: "2024", series: "HW Exotics", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPJ-o_lDNvdfita_Vt9CQyM5ZYagHA_bbOiG_2TMtwFNicPFK1AmToaa3mI8W_Bg4nuF7QmWtb_sGPlnzIXYvCj4V1bqjcgwVzjPHtnOmj8ZND_M0daiDqrEunfae5nF8KVgpoUhdnliZPpTyKoDLRoziqZIz_t6l3610GGtNn42EOJfYsOq1sO_v93nwEICxBn4k6taRVUVpg0ocU6x_4KldcGZPN96-vO3US2goOfEXoikOu1FxuHH6ZZzz2snt3ZpX0lrul4bc" },
  { name: "Lotus Evija", year: "2023", series: "HW Green Speed", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdQhVtGwaiP0cwO6TO7noyJO7zIUwFZIqAik1uJTOpfBWe5kqW3NWA8ZwenfMCckCBiG8Dq5f1Nu4YhiSm3tP11rErZrDDX2dAi6XvL0B1Sg5I43shH4zYxvSn48lboD6ySTUcGSC68bhKofG3oJx_HcrW7sN0m6R8y5YxT1sUgh6_0HsZuPTqSmtqQ8VfcYkzbxZlYfGxg1cS7l8RLCKtsj1G3FdX_37fjeQBEsPyy58nlGqexauGsRADOfgTkPSJ7BEn9ByDDSo" },
  
  // American Muscle
  { name: "Shelby GT500", year: "2024", series: "Muscle Mania", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBejTqFREqoc73fY6hdevf54cFdor7OfZE451XCMDg_Cb5NlURyEGWnoovsyAPPPeWJqOliEfKCbp2Owtqmt5okpDeBcAqMW3KCeqh6LIz4n-8W9_w96nOqWosiluzukzwjqLv6MDbRq4hftWIHN65he4QhOKYVcPnKQ5ZtIc6bpqlhQBLdI1__BanJYj-Hr-NZmzA5r5sYqR_APtNpq3n3fxet0lD4Hz52otKlclxkVJ-FuDYp48E2sn0IlsG0DiRtIaaFt8SvMMs" },
  { name: "'67 Camaro", year: "2024", series: "HW Art Cars", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXT6eLfqcnXudqCOf6cTBTABnCzBsxAELj_dQ2RO343BbUtE5whoGAWUTGonYGeAFG8T6sajWTHlIWoNCt-wnIo4Ocnols0PMHQG9JgC59M_Z2rgoF3daV19TO3wnFSOK3EdA6lBoj3T0zREhDdAPvf5CssuYWVrhZOI5LqUVxlpc7G3-Pw7Wr94clKqMnY-PZ77LXzzzI6O028Z6HJVABZT7Qbq_bs0ER1J7phiAPTwTONGpDXXrlgpmzKbPfP5KqVglejrjGHSI" },
  
  // Fun & Fantasy
  { name: "Monster High Ghoul Mobile", year: "2024", series: "HW Screen Time", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxiGdEMZf3Ut9pLh9-TKLtf7y5aYyQLjWIw6FcJbmyd4X_e6K2vPB5n2F1T4ctT4gxSTX-0XL4N3BVtkXSUzPTe19hpfPIv-r7WBrrgEMQymtbKEJr31V6xJeTYiGhhwssvKqgaegOJcsG1riZevR45Se8Hcxt2Unte9lieOm7Ny7j4dfaJvh0VjnAfNq8xTIOPnWjaoG6_yRyKRzvIWJPmezwzq45vVTGtClQrcj44VxJQv0bn8DYfL0u6qurW5NSDZDYVAUIojA" },
  { name: "Grumobile", year: "2024", series: "HW Screen Time", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCR8cdG4oFA0L-K-wB7m6T2-OKG55Jcn1YPsrlt_YyO3TmlNVui9ddJV8koZetj4Cdn2h4g4z2uaIvNkfDYRst81uk2dVG8k_DR8kqMqahYqgeR0Ee8r3cNxymICAgNK4XlmBL7VLvJubyt6CdqKV8O6ghyCW27_AWw7Oc1RoaNxL3PyIHlapcv9V2HuSGIeZon4EjdFv9sa6tsPWwuQCxhOhCXlP2MJoTP-WKB-y2baPuH0hj8LsBCWIu-Qs0DncTVrMSh8tCFeCs" },
  { name: "Pass 'n Go", year: "2025", series: "Basic Line", image: "/cars/pass_n_go_1776684760254.png" },
  { name: "RD-06", year: "2025", series: "Basic Line", image: "/cars/rd_06_1776684776280.png" },

  // More 2024 Mainline
  { name: "Cadillac Project GTP Hypercar", year: "2024", series: "HW Turbo", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAopkQgVBICaNlEl6GB5VdxoNMYAelF9X93fcuanC1g8RQ5fVzZ3tA_JYDgwQKXpi9P5ZMsC0hwiVjg4wvIISXb2IfzBcssdfg5hG7on0KbmvP86ITt78dUsIDuWGoMAAO3XTguSI_11uJPCVHhqbeXeZoHU_pnEzr0YKB8wMh-r-9XLFSIHmZNvsg8wuR5nX0hbhS6BT3sNRcIbphQ7vF4AlNkphzHa8WduocMhgnG2_l04jqImHOPEDfzXKl6MMmEJSzDHS3lcEo" },
  { name: "Ford Maverick Custom", year: "2024", series: "HW Hot Trucks", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsyaT9nUD71dH4BSf0cj5J8W6G1rrmlzwB9O64MjTnXGRseNSrKIPRynHs2bm1ybmRJXqs9tCinOmCRnh4GUjVUD1914Pgovy_Tz4wTfIu0EAZZvKxSAlzPyY1Au-c8P58wM6jiePC8RFCCs5CFqaMfWDFFC9Y3IXTIVnz5UH1pELwuoOMkeVT3u-DZAUTYGwWZTj48UVB4Ouen-9UwFObvf2XoXyLR-1-EoWv2KtxAGEF2Y40EdrB4-tUVIe5b2hgzVIXwwvvIRU" },
  { name: "Audi RS e-tron GT", year: "2024", series: "Factory Fresh", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDppfkRoAsfgcg0D7syBeH8l0FyVDZi-r3PTr3p1FiOz_7MLCQfcWhE1vTpSs0_mJ_KrLIXxQRQJFcJuMogaeAiCt2yV7L00NT3EEfT7kNaux3QkjiUbFtq7FK3gBl3PP9RqRl06UNsgrWUkHJw-2Wm5jaW7-pUoVJfih7fAuuVRni-SZbsRKAyA8S7rCtFwDrFX3617zuLteW4QKjmIytIUmMpEi92OGWGjZabzOfDkE_Cn8mQe1OXfKBYEEsPpHqHziIxkvQoe1w" },
  { name: "'47 Chevy Fleetline", year: "2024", series: "Treasure Hunt", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPJ-o_lDNvdfita_Vt9CQyM5ZYagHA_bbOiG_2TMtwFNicPFK1AmToaa3mI8W_Bg4nuF7QmWtb_sGPlnzIXYvCj4V1bqjcgwVzjPHtnOmj8ZND_M0daiDqrEunfae5nF8KVgpoUhdnliZPpTyKoDLRoziqZIz_t6l3610GGtNn42EOJfYsOq1sO_v93nwEICxBn4k6taRVUVpg0ocU6x_4KldcGZPN96-vO3US2goOfEXoikOu1FxuHH6ZZzz2snt3ZpX0lrul4bc" },
  { name: "Lucid Air", year: "2024", series: "HW Green Speed", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdQhVtGwaiP0cwO6TO7noyJO7zIUwFZIqAik1uJTOpfBWe5kqW3NWA8ZwenfMCckCBiG8Dq5f1Nu4YhiSm3tP11rErZrDDX2dAi6XvL0B1Sg5I43shH4zYxvSn48lboD6ySTUcGSC68bhKofG3oJx_HcrW7sN0m6R8y5YxT1sUgh6_0HsZuPTqSmtqQ8VfcYkzbxZlYfGxg1cS7l8RLCKtsj1G3FdX_37fjeQBEsPyy58nlGqexauGsRADOfgTkPSJ7BEn9ByDDSo" },
  { name: "Rimac Nevera", year: "2024", series: "HW Green Speed", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBejTqFREqoc73fY6hdevf54cFdor7OfZE451XCMDg_Cb5NlURyEGWnoovsyAPPPeWJqOliEfKCbp2Owtqmt5okpDeBcAqMW3KCeqh6LIz4n-8W9_w96nOqWosiluzukzwjqLv6MDbRq4hftWIHN65he4QhOKYVcPnKQ5ZtIc6bpqlhQBLdI1__BanJYj-Hr-NZmzA5r5sYqR_APtNpq3n3fxet0lD4Hz52otKlclxkVJ-FuDYp48E2sn0IlsG0DiRtIaaFt8SvMMs" },
  { name: "'90 Honda Civic EF", year: "2024", series: "HW J-Imports", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXT6eLfqcnXudqCOf6cTBTABnCzBsxAELj_dQ2RO343BbUtE5whoGAWUTGonYGeAFG8T6sajWTHlIWoNCt-wnIo4Ocnols0PMHQG9JgC59M_Z2rgoF3daV19TO3wnFSOK3EdA6lBoj3T0zREhDdAPvf5CssuYWVrhZOI5LqUVxlpc7G3-Pw7Wr94clKqMnY-PZ77LXzzzI6O028Z6HJVABZT7Qbq_bs0ER1J7phiAPTwTONGpDXXrlgpmzKbPfP5KqVglejrjGHSI" },
  { name: "BMW M3 Wagon", year: "2024", series: "Factory Fresh", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxiGdEMZf3Ut9pLh9-TKLtf7y5aYyQLjWIw6FcJbmyd4X_e6K2vPB5n2F1T4ctT4gxSTX-0XL4N3BVtkXSUzPTe19hpfPIv-r7WBrrgEMQymtbKEJr31V6xJeTYiGhhwssvKqgaegOJcsG1riZevR45Se8Hcxt2Unte9lieOm7Ny7j4dfaJvh0VjnAfNq8xTIOPnWjaoG6_yRyKRzvIWJPmezwzq45vVTGtClQrcj44VxJQv0bn8DYfL0u6qurW5NSDZDYVAUIojA" },
  { name: "Pagani Utopia", year: "2024", series: "HW Exotics", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCR8cdG4oFA0L-K-wB7m6T2-OKG55Jcn1YPsrlt_YyO3TmlNVui9ddJV8koZetj4Cdn2h4g4z2uaIvNkfDYRst81uk2dVG8k_DR8kqMqahYqgeR0Ee8r3cNxymICAgNK4XlmBL7VLvJubyt6CdqKV8O6ghyCW27_AWw7Oc1RoaNxL3PyIHlapcv9V2HuSGIeZon4EjdFv9sa6tsPWwuQCxhOhCXlP2MJoTP-WKB-y2baPuH0hj8LsBCWIu-Qs0DncTVrMSh8tCFeCs" },
  { name: "Aston Martin Valkyrie", year: "2024", series: "HW Exotics", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAopkQgVBICaNlEl6GB5VdxoNMYAelF9X93fcuanC1g8RQ5fVzZ3tA_JYDgwQKXpi9P5ZMsC0hwiVjg4wvIISXb2IfzBcssdfg5hG7on0KbmvP86ITt78dUsIDuWGoMAAO3XTguSI_11uJPCVHhqbeXeZoHU_pnEzr0YKB8wMh-r-9XLFSIHmZNvsg8wuR5nX0hbhS6BT3sNRcIbphQ7vF4AlNkphzHa8WduocMhgnG2_l04jqImHOPEDfzXKl6MMmEJSzDHS3lcEo" },
  { name: "'73 Jeep J10", year: "2024", series: "HW Hot Trucks", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsyaT9nUD71dH4BSf0cj5J8W6G1rrmlzwB9O64MjTnXGRseNSrKIPRynHs2bm1ybmRJXqs9tCinOmCRnh4GUjVUD1914Pgovy_Tz4wTfIu0EAZZvKxSAlzPyY1Au-c8P58wM6jiePC8RFCCs5CFqaMfWDFFC9Y3IXTIVnz5UH1pELwuoOMkeVT3u-DZAUTYGwWZTj48UVB4Ouen-9UwFObvf2XoXyLR-1-EoWv2KtxAGEF2Y40EdrB4-tUVIe5b2hgzVIXwwvvIRU" },
  { name: "Hummer EV", year: "2024", series: "HW Green Speed", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDppfkRoAsfgcg0D7syBeH8l0FyVDZi-r3PTr3p1FiOz_7MLCQfcWhE1vTpSs0_mJ_KrLIXxQRQJFcJuMogaeAiCt2yV7L00NT3EEfT7kNaux3QkjiUbFtq7FK3gBl3PP9RqRl06UNsgrWUkHJw-2Wm5jaW7-pUoVJfih7fAuuVRni-SZbsRKAyA8S7rCtFwDrFX3617zuLteW4QKjmIytIUmMpEi92OGWGjZabzOfDkE_Cn8mQe1OXfKBYEEsPpHqHziIxkvQoe1w" },
  { name: "DeLorean Alpha5", year: "2024", series: "HW Green Speed", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPJ-o_lDNvdfita_Vt9CQyM5ZYagHA_bbOiG_2TMtwFNicPFK1AmToaa3mI8W_Bg4nuF7QmWtb_sGPlnzIXYvCj4V1bqjcgwVzjPHtnOmj8ZND_M0daiDqrEunfae5nF8KVgpoUhdnliZPpTyKoDLRoziqZIz_t6l3610GGtNn42EOJfYsOq1sO_v93nwEICxBn4k6taRVUVpg0ocU6x_4KldcGZPN96-vO3US2goOfEXoikOu1FxuHH6ZZzz2snt3ZpX0lrul4bc" },
  { name: "Mercedes-AMG GT", year: "2024", series: "Factory Fresh", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdQhVtGwaiP0cwO6TO7noyJO7zIUwFZIqAik1uJTOpfBWe5kqW3NWA8ZwenfMCckCBiG8Dq5f1Nu4YhiSm3tP11rErZrDDX2dAi6XvL0B1Sg5I43shH4zYxvSn48lboD6ySTUcGSC68bhKofG3oJx_HcrW7sN0m6R8y5YxT1sUgh6_0HsZuPTqSmtqQ8VfcYkzbxZlYfGxg1cS7l8RLCKtsj1G3FdX_37fjeQBEsPyy58nlGqexauGsRADOfgTkPSJ7BEn9ByDDSo" },
  { name: "Volkswagen ID. Buzz", year: "2024", series: "HW Green Speed", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBejTqFREqoc73fY6hdevf54cFdor7OfZE451XCMDg_Cb5NlURyEGWnoovsyAPPPeWJqOliEfKCbp2Owtqmt5okpDeBcAqMW3KCeqh6LIz4n-8W9_w96nOqWosiluzukzwjqLv6MDbRq4hftWIHN65he4QhOKYVcPnKQ5ZtIc6bpqlhQBLdI1__BanJYj-Hr-NZmzA5r5sYqR_APtNpq3n3fxet0lD4Hz52otKlclxkVJ-FuDYp48E2sn0IlsG0DiRtIaaFt8SvMMs" },
  { name: "Alfa Romeo Giulia Sprint GTA", year: "2024", series: "Factory Fresh", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXT6eLfqcnXudqCOf6cTBTABnCzBsxAELj_dQ2RO343BbUtE5whoGAWUTGonYGeAFG8T6sajWTHlIWoNCt-wnIo4Ocnols0PMHQG9JgC59M_Z2rgoF3daV19TO3wnFSOK3EdA6lBoj3T0zREhDdAPvf5CssuYWVrhZOI5LqUVxlpc7G3-Pw7Wr94clKqMnY-PZ77LXzzzI6O028Z6HJVABZT7Qbq_bs0ER1J7phiAPTwTONGpDXXrlgpmzKbPfP5KqVglejrjGHSI" }
];

export default function DiscoverPage() {
  const { addModel, models, user } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSeries, setActiveSeries] = useState("All");
  const [addingId, setAddingId] = useState<string | null>(null);

  const seriesOptions = useMemo(() => {
    const series = Array.from(new Set(DISCOVERY_DATABASE.map(m => m.series)));
    return ["All", ...series.sort()];
  }, []);

  const filteredModels = useMemo(() => {
    return DISCOVERY_DATABASE.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.series.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeries = activeSeries === "All" || m.series === activeSeries;
      return matchesSearch && matchesSeries;
    });
  }, [searchQuery, activeSeries]);

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
    <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1600px] mx-auto w-full min-h-screen">
      {/* Header Section */}
      <header className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-primary-container" size={20} />
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">Global Archive</span>
          </div>
          <h1 className="font-headline text-5xl md:text-8xl font-bold tracking-tighter text-on-surface mb-6 uppercase">
            Discover <span className="text-primary-container">Castings</span>
          </h1>
          <p className="text-on-surface-variant/70 leading-relaxed max-w-lg text-lg">
            Explore the definitive Hot Wheels database. Uncover legendary silhouettes and instantly append them to your private digital museum.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
          {/* Series Filter */}
          <div className="relative group min-w-[200px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40" size={16} />
            <select 
              value={activeSeries}
              aria-label="Filter by Hot Wheels series"
              onChange={(e) => setActiveSeries(e.target.value)}
              className="w-full bg-surface-container border-b-2 border-outline-variant/20 py-4 pl-12 pr-10 focus:border-primary transition-all outline-none font-body text-sm appearance-none cursor-pointer text-on-surface"
            >
              {seriesOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text"
              aria-label="Search Hot Wheels castings or series"
              placeholder="Search by casting or series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container border-b-2 border-outline-variant/20 py-4 pl-12 pr-6 focus:border-primary transition-all outline-none font-body text-sm text-on-surface"
            />
          </div>
        </div>
      </header>

      {/* Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {filteredModels.map((item, index) => {
          const inCollection = isAlreadyInCollection(item.name);
          const isAdding = addingId === item.name;

          return (
            <article 
              key={index}
              className="bg-surface-container-low group hover:bg-surface-container transition-all duration-500 border border-white/5 relative overflow-hidden flex flex-col"
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

              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-label text-[9px] tracking-widest text-primary-container uppercase font-bold">{item.series}</span>
                  <span className="font-label text-[9px] tracking-widest text-on-surface/40 uppercase font-bold">{item.year}</span>
                </div>
                <h3 className="font-headline text-lg font-bold text-on-surface uppercase mb-6 line-clamp-2 min-h-[3.5rem]">{item.name}</h3>
                
                <div className="mt-auto">
                  <button 
                    onClick={() => handleAdd(item)}
                    disabled={inCollection || isAdding || !user}
                    aria-label={inCollection ? `${item.name} is already in your collection` : `Acquire ${item.name}`}
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
              </div>
            </article>
          );
        })}

        {filteredModels.length === 0 && (
          <div className="col-span-full py-32 text-center bg-surface-container-low border border-dashed border-white/5">
            <p className="text-on-surface/40 font-body italic text-xl mb-4">No legendary castings found matching your criteria</p>
            <button 
              onClick={() => {setSearchQuery(""); setActiveSeries("All");}}
              className="text-primary-container hover:text-primary font-label text-xs uppercase tracking-widest font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Footer Metrics */}
      <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-on-surface/30 font-label text-[10px] uppercase tracking-widest">
          Displaying {filteredModels.length} of {DISCOVERY_DATABASE.length} castings
        </div>
        {!user && (
          <p className="text-primary-container font-label text-[10px] uppercase tracking-widest font-bold animate-pulse">
            Sign in to start acquiring new pieces
          </p>
        )}
      </footer>
    </main>
  );
}
