import type { Destination } from "./types";

// REVIEW: copy — placeholder destination copy, to be tuned for launch
export const destinations: Destination[] = [
  {
    slug: "new-cairo",
    name: { en: "New Cairo", ar: "القاهرة الجديدة" },
    shortPitch: {
      en: "Quiet compounds, fast roads, and the city's calmest mornings.",
      ar: "كومباوندات هادئة، طرق سريعة، وأهدأ صباحات في المدينة.",
    },
    longDescription: {
      en: "New Cairo balances residential calm with quick access to the airport, business districts, and the AUC. Our homes here lean spacious — perfect for families, long-stay professionals, and anyone who wants the city without its noise.",
      ar: "تجمع القاهرة الجديدة بين هدوء السكن وقربها من المطار والمناطق التجارية والجامعة الأمريكية. بيوتنا هنا واسعة، مثالية للعائلات والمهنيين والإقامات الطويلة، ولكلّ من يريد المدينة بلا ضجيجها.",
    },
    heroImage: "https://picsum.photos/seed/th-newcairo/1920/1080",
    thumbnail: "https://picsum.photos/seed/th-newcairo/800/600",
    homeCount: 3,
    startingNightlyEGP: 2400,
    coordinates: { lat: 30.0086, lng: 31.4326 },
    category: "suburban",
  },
  {
    slug: "sheikh-zayed",
    name: { en: "Sheikh Zayed", ar: "الشيخ زايد" },
    shortPitch: {
      en: "West Cairo's design district — wide streets, leafy compounds, and great coffee.",
      ar: "حيّ التصميم في غرب القاهرة — شوارع واسعة، كومباوندات خضراء، وقهوة ممتازة.",
    },
    longDescription: {
      en: "Sheikh Zayed has quietly become a creative quarter — independent cafés, modernist villas, and easy reach into Mohandessin. Our homes here are smaller, sharper, and a few minutes from the best brunch in town.",
      ar: "تحوّل الشيخ زايد بهدوء إلى حيّ إبداعي — مقاهٍ مستقلّة، فيلات حديثة، ووصول سريع إلى المهندسين. بيوتنا هنا أصغر وأكثر حدّة في التفاصيل، على بُعد دقائق من أفضل برانش في المدينة.",
    },
    heroImage: "https://picsum.photos/seed/th-zayed/1920/1080",
    thumbnail: "https://picsum.photos/seed/th-zayed/800/600",
    homeCount: 2,
    startingNightlyEGP: 2200,
    coordinates: { lat: 30.0606, lng: 30.9712 },
    category: "suburban",
  },
  {
    slug: "downtown-cairo",
    name: { en: "Downtown Cairo", ar: "وسط القاهرة" },
    shortPitch: {
      en: "Belle Époque buildings, jazz cafés, and the museum across the bridge.",
      ar: "مبانٍ من العصر الذهبي، مقاهي جاز، والمتحف خلف الكوبري.",
    },
    longDescription: {
      en: "Downtown is where Cairo's twentieth century lives. Our homes here sit inside heritage buildings — high ceilings, original tiles — and walk you to Tahrir, the Egyptian Museum, and the river in under fifteen minutes.",
      ar: "وسط القاهرة هو حيث يسكن القرن العشرين للمدينة. بيوتنا هنا داخل مبانٍ تراثية — أسقف عالية وبلاطات أصلية — تمشي بك إلى التحرير والمتحف والنيل في أقلّ من ربع ساعة.",
    },
    heroImage: "https://picsum.photos/seed/th-downtown/1920/1080",
    thumbnail: "https://picsum.photos/seed/th-downtown/800/600",
    homeCount: 2,
    startingNightlyEGP: 1900,
    coordinates: { lat: 30.0444, lng: 31.2357 },
    category: "urban",
  },
  {
    slug: "north-coast",
    name: { en: "North Coast", ar: "الساحل الشمالي" },
    shortPitch: {
      en: "Mediterranean blue, summer-only homes, slow afternoons.",
      ar: "أزرق المتوسط، بيوت موسمية، وأصائل بطيئة.",
    },
    longDescription: {
      en: "Our North Coast homes open in summer along the Sahel. Sea views, walkable beaches, and the kind of light you only find on the Egyptian Mediterranean. Booked in fortnight blocks.",
      ar: "تفتح بيوتنا في الساحل الشمالي صيفًا. إطلالات على البحر، شواطئ يمكن المشي إليها، وضوء لا تجده إلا على المتوسط المصري. تُحجز عادة بنصف الشهر.",
    },
    heroImage: "https://picsum.photos/seed/th-northcoast/1920/1080",
    thumbnail: "https://picsum.photos/seed/th-northcoast/800/600",
    homeCount: 2,
    startingNightlyEGP: 4500,
    coordinates: { lat: 30.9176, lng: 28.9536 },
    category: "beach",
  },
  {
    slug: "el-gouna",
    name: { en: "El Gouna", ar: "الجونة" },
    shortPitch: {
      en: "Lagoons, kite-friendly winds, and that distinct Gouna calm.",
      ar: "بحيرات، رياح مناسبة للكايت، وذلك الهدوء الجوني المميّز.",
    },
    longDescription: {
      en: "El Gouna is a year-round home for design-led travelers. Our homes here put you within walking distance of Abu Tig Marina, kite spots at Mangroovy, and quiet mornings on private beaches.",
      ar: "الجونة بيت لمحبّي التصميم على مدار العام. بيوتنا هنا على بُعد مسافة قصيرة من مارينا أبو تيج، ومواقع الكايت في منجروفي، وصباحات هادئة على شواطئ خاصة.",
    },
    heroImage: "https://picsum.photos/seed/th-gouna/1920/1080",
    thumbnail: "https://picsum.photos/seed/th-gouna/800/600",
    homeCount: 2,
    startingNightlyEGP: 3800,
    coordinates: { lat: 27.3914, lng: 33.6772 },
    category: "beach",
  },
  {
    slug: "golden-gates",
    name: { en: "Golden Gates", ar: "البوابات الذهبية" },
    shortPitch: {
      en: "A garden compound on the way to the airport — ideal for first or last nights.",
      ar: "كومباوند بحديقة في الطريق للمطار — مثالي لأول الإقامة أو آخرها.",
    },
    longDescription: {
      en: "Golden Gates is our newest cluster — modern homes inside a single garden compound, fifteen minutes from Cairo airport and twenty from the Ring Road. Made for the awkward arrival hour and the early-morning departure.",
      ar: "البوابات الذهبية أحدث مجموعاتنا — بيوت حديثة داخل كومباوند بحديقة واحدة، على بُعد ربع ساعة من مطار القاهرة وعشرين دقيقة من الطريق الدائري. مصمّمة لساعة الوصول المتأخّرة والمغادرة الباكرة.",
    },
    heroImage: "https://picsum.photos/seed/th-goldengates/1920/1080",
    thumbnail: "https://picsum.photos/seed/th-goldengates/800/600",
    homeCount: 1,
    startingNightlyEGP: 2100,
    coordinates: { lat: 30.118, lng: 31.4 },
    category: "suburban",
  },
];
