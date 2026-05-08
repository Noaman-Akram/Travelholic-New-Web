import type { Area, Destination } from "./types";

// REVIEW: copy — placeholder destination copy, to be tuned for launch

export const areas: Area[] = [
  {
    slug: "new-cairo",
    name: { en: "New Cairo", ar: "القاهرة الجديدة" },
    blurb: {
      en: "Quiet compounds, fast roads, and the city's calmest mornings.",
      ar: "كومباوندات هادئة، طرق سريعة، وأهدأ صباحات في المدينة.",
    },
  },
  {
    slug: "golden-gates",
    name: { en: "Golden Gates", ar: "البوابات الذهبية" },
    blurb: {
      en: "On the Mokattam–Nasr City corridor — close to the airport, ten minutes from downtown.",
      ar: "على محور المقطم – مدينة نصر — قريب من المطار، عشر دقائق من وسط البلد.",
    },
  },
];

export const destinations: Destination[] = [
  // ─── New Cairo ──────────────────────────────────────────────────────────
  {
    slug: "lotus",
    name: { en: "Lotus", ar: "اللوتس" },
    area: "new-cairo",
    areaName: { en: "New Cairo", ar: "القاهرة الجديدة" },
    shortPitch: {
      en: "A residential pocket of New Cairo with leafy streets and quiet evenings.",
      ar: "جيب سكني في القاهرة الجديدة بشوارع خضراء ومساءات هادئة.",
    },
    longDescription: {
      en: "Lotus is one of the older districts of New Cairo — wide blocks, tree-lined streets, and a slow pace. Families settle here. Our homes are built for that rhythm: real kitchens, generous beds, and quiet bedrooms that face away from the road.",
      ar: "اللوتس من أقدم مناطق القاهرة الجديدة — بلوكات واسعة، شوارع مظلّلة بالأشجار، وإيقاع بطيء. العائلات تستقرّ هنا. بيوتنا مبنيّة لهذا الإيقاع: مطابخ حقيقية، أَسرّة كريمة، وغرف نوم بعيدة عن الشارع.",
    },
    heroImage: "https://picsum.photos/seed/th-lotus/1920/1080",
    thumbnail: "https://picsum.photos/seed/th-lotus/800/600",
    homeCount: 18,
    startingNightlyEGP: 2400,
    coordinates: { lat: 30.0153, lng: 31.4501 },
    category: "suburban",
  },
  {
    slug: "auc",
    name: { en: "AUC", ar: "الجامعة الأمريكية" },
    area: "new-cairo",
    areaName: { en: "New Cairo", ar: "القاهرة الجديدة" },
    shortPitch: {
      en: "Around the American University in Cairo — academic calm, Mediterranean cafés.",
      ar: "حول الجامعة الأمريكية في القاهرة — هدوء أكاديمي، ومقاهٍ على الطراز المتوسطي.",
    },
    longDescription: {
      en: "The blocks around AUC are built for thinkers, freelancers, and visiting families. Cafés stay open late, the streets stay quiet, and our homes here favor good desks and faster Wi-Fi over flash.",
      ar: "البلوكات المحيطة بالجامعة الأمريكية مبنيّة للمفكّرين والمستقلّين والعائلات الزائرة. المقاهي تظلّ مفتوحة لوقت متأخّر، الشوارع تبقى هادئة، وبيوتنا هنا تفضّل المكتب الجيد والواي فاي السريع على المظهر.",
    },
    heroImage: "https://picsum.photos/seed/th-auc/1920/1080",
    thumbnail: "https://picsum.photos/seed/th-auc/800/600",
    homeCount: 14,
    startingNightlyEGP: 1900,
    coordinates: { lat: 29.9989, lng: 31.4992 },
    category: "suburban",
  },
  {
    slug: "near-cfc",
    name: { en: "Near CFC", ar: "بجوار سي إف سي" },
    area: "new-cairo",
    areaName: { en: "New Cairo", ar: "القاهرة الجديدة" },
    shortPitch: {
      en: "A short walk from Cairo Festival City — shopping, dining, and the city's best brunch.",
      ar: "على بُعد دقائق من كايرو فستيفال سيتي — تسوّق ومطاعم وأفضل برانش في المدينة.",
    },
    longDescription: {
      en: "Five minutes from CFC's malls and restaurants, ten from the Ring Road, fifteen from the airport. Our homes here lean toward families and short business stays — fully kitted kitchens, parking, and a concierge ready for the airport run.",
      ar: "خمس دقائق من مولات ومطاعم سي إف سي، عشر دقائق من الطريق الدائري، ربع ساعة من المطار. بيوتنا هنا تميل للعائلات وإقامات العمل القصيرة — مطابخ كاملة، موقف، وكونسيرج مستعدّ لرحلة المطار.",
    },
    heroImage: "https://picsum.photos/seed/th-cfc/1920/1080",
    thumbnail: "https://picsum.photos/seed/th-cfc/800/600",
    homeCount: 14,
    startingNightlyEGP: 2500,
    coordinates: { lat: 30.0286, lng: 31.4076 },
    category: "urban",
  },
  {
    slug: "ninetieth-street",
    name: { en: "90th Street", ar: "شارع التسعين" },
    area: "new-cairo",
    areaName: { en: "New Cairo", ar: "القاهرة الجديدة" },
    shortPitch: {
      en: "The commercial spine of New Cairo — premium towers, top restaurants, fastest commute.",
      ar: "العمود التجاري للقاهرة الجديدة — أبراج راقية، أفضل المطاعم، وأسرع وصول للمدينة.",
    },
    longDescription: {
      en: "90th Street is where New Cairo works. Our homes on the avenue and a block off it sit inside the newer towers — high floors, double-glazed windows that take the avenue's noise out, and views that reach all the way to the eastern desert.",
      ar: "شارع التسعين هو المكان الذي تعمل فيه القاهرة الجديدة. بيوتنا على الشارع وعلى بُعد بلوك منه داخل الأبراج الأحدث — طوابق عالية، نوافذ مزدوجة تخفّ من ضجيج الشارع، وإطلالات تمتدّ حتى الصحراء الشرقية.",
    },
    heroImage: "https://picsum.photos/seed/th-90th/1920/1080",
    thumbnail: "https://picsum.photos/seed/th-90th/800/600",
    homeCount: 24,
    startingNightlyEGP: 2200,
    coordinates: { lat: 30.0244, lng: 31.4569 },
    category: "urban",
  },
  // ─── Golden Gates ───────────────────────────────────────────────────────
  {
    slug: "gg-buildings",
    name: { en: "GG Buildings", ar: "عمارات البوابات الذهبية" },
    area: "golden-gates",
    areaName: { en: "Golden Gates", ar: "البوابات الذهبية" },
    shortPitch: {
      en: "Apartment buildings inside the Golden Gates compound — quiet, secure, and a short hop to the airport.",
      ar: "عمارات سكنية داخل كومباوند البوابات الذهبية — هادئة وآمنة وعلى بُعد قصير من المطار.",
    },
    longDescription: {
      en: "Forty-two units across a handful of mid-rise buildings inside Golden Gates. Studios up to 2-bedrooms, all with the same compound amenities — pool, gym, 24/7 security — and an in-house concierge who handles airport pickups.",
      ar: "اثنتان وأربعون وحدة في عدد من العمارات متوسّطة الارتفاع داخل البوابات الذهبية. من الاستوديوهات إلى الغرفتين، جميعها بنفس مرافق الكومباوند — حمّام سباحة، جيم، أمن على مدار الساعة — وكونسيرج داخلي يتكفّل بالاستقبال من المطار.",
    },
    heroImage: "https://picsum.photos/seed/th-gg-buildings/1920/1080",
    thumbnail: "https://picsum.photos/seed/th-gg-buildings/800/600",
    homeCount: 42,
    startingNightlyEGP: 1800,
    coordinates: { lat: 30.0466, lng: 31.3567 },
    category: "compound",
  },
  {
    slug: "gg-villas",
    name: { en: "GG Villas", ar: "فيلات البوابات الذهبية" },
    area: "golden-gates",
    areaName: { en: "Golden Gates", ar: "البوابات الذهبية" },
    shortPitch: {
      en: "Eight standalone villas inside Golden Gates — private gardens, bigger groups, slower stays.",
      ar: "ثماني فيلات مستقلّة داخل البوابات الذهبية — حدائق خاصة، مجموعات أكبر، وإقامات أبطأ.",
    },
    longDescription: {
      en: "Eight villas only — small enough that we know each one by its quirks. Private gardens, three to four bedrooms, kitchens that take a real dinner party, and a quiet cul-de-sac that stays cool into the evening.",
      ar: "ثماني فيلات فقط — قليلة بما يكفي لنعرف كلّ واحدة بتفاصيلها. حدائق خاصة، ثلاث إلى أربع غرف نوم، مطابخ تتّسع لعشاء حقيقي، وحارة هادئة تظلّ منعشة حتى المساء.",
    },
    heroImage: "https://picsum.photos/seed/th-gg-villas/1920/1080",
    thumbnail: "https://picsum.photos/seed/th-gg-villas/800/600",
    homeCount: 8,
    startingNightlyEGP: 6500,
    coordinates: { lat: 30.0498, lng: 31.3592 },
    category: "compound",
  },
  {
    slug: "nomads",
    name: { en: "Nomads", ar: "نومادز" },
    area: "golden-gates",
    areaName: { en: "Golden Gates", ar: "البوابات الذهبية" },
    shortPitch: {
      en: "A long-stay project for remote workers and slow travelers — co-living energy, private apartments.",
      ar: "مشروع للإقامات الطويلة للعاملين عن بُعد ومسافري الإقامة الطويلة — طاقة كو-ليفينج بشقق خاصة.",
    },
    longDescription: {
      en: "Nomads is the sister project of GG Buildings — same compound, different proposition. Built for guests staying a month or longer: lounge spaces, a quiet co-working floor, monthly rates that work, and a community that doesn't ask too much of you.",
      ar: "نومادز هو المشروع الشقيق لعمارات البوابات الذهبية — نفس الكومباوند، وعرض مختلف. مبني للضيوف الذين يقيمون شهرًا فأكثر: قاعات لاونج، طابق كو-ووركينغ هادئ، أسعار شهرية تعمل، ومجتمع لا يطلب منك الكثير.",
    },
    heroImage: "https://picsum.photos/seed/th-nomads/1920/1080",
    thumbnail: "https://picsum.photos/seed/th-nomads/800/600",
    homeCount: 14,
    startingNightlyEGP: 2000,
    coordinates: { lat: 30.0440, lng: 31.3633 },
    category: "co-living",
  },
];

export function getAreaSlug(destination: Destination): "new-cairo" | "golden-gates" {
  return destination.area;
}

export function getDestinationsByArea(area: "new-cairo" | "golden-gates") {
  return destinations.filter((d) => d.area === area);
}
