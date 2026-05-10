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
    name: { en: "Golden Gates", ar: "جولدن جاتس" },
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
      en: "A residential pocket near Mivida — leafy streets, quiet evenings, slow pace.",
      ar: "جيب سكني بجوار ميڤيدا — شوارع خضراء، مساءات هادئة، إيقاع بطيء.",
    },
    longDescription: {
      en: "Lotus sits in the older quarter of New Cairo, a few minutes from Mivida — wide blocks, tree-lined streets, and a calm rhythm. Families settle here. Our homes are built for that rhythm: real kitchens, generous beds, and quiet bedrooms that face away from the road.",
      ar: "اللوتس في الجزء الأقدم من القاهرة الجديدة، على بُعد دقائق من ميڤيدا — بلوكات واسعة، شوارع مظلّلة بالأشجار، وإيقاع هادئ. العائلات تستقرّ هنا. بيوتنا مبنيّة لهذا الإيقاع: مطابخ حقيقية، أَسرّة كريمة، وغرف نوم بعيدة عن الشارع.",
    },
    heroImage: "https://img.hostify.com/700000523/property/24fe17b31c279a0db4394c3d8f6a6cdf-full.jpg",
    thumbnail: "https://img.hostify.com/700000523/property/3743c20557bbcf5cb4bb1b6b9d37a83a-full.jpg",
    homeCount: 6,
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
    heroImage: "https://img.hostify.com/700000523/property/5e7346d26e80b1bad856bf751891791f-full.jpg",
    thumbnail: "https://img.hostify.com/700000523/property/271aadbf555f7e029dff505b17bfccb4-full.jpg",
    homeCount: 6,
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
    heroImage: "https://img.hostify.com/700000523/property/73e8fc172c84b9bb9b0a6b02d0e58ee4-full.jpg",
    thumbnail: "https://img.hostify.com/700000523/property/8a211316f9c351179641359fbbebb4da-full.jpg",
    homeCount: 3,
    startingNightlyEGP: 2500,
    coordinates: { lat: 30.0286, lng: 31.4076 },
    category: "urban",
  },
  {
    slug: "ninetieth-street",
    name: { en: "90 Street", ar: "شارع التسعين" },
    area: "new-cairo",
    areaName: { en: "New Cairo", ar: "القاهرة الجديدة" },
    shortPitch: {
      en: "The commercial spine of New Cairo — premium towers, top restaurants, fastest commute.",
      ar: "العمود التجاري للقاهرة الجديدة — أبراج راقية، أفضل المطاعم، وأسرع وصول للمدينة.",
    },
    longDescription: {
      en: "90 Street is where New Cairo works. Our homes on the avenue and a block off it sit inside the newer towers — high floors, double-glazed windows that take the avenue's noise out, and views that reach all the way to the eastern desert.",
      ar: "شارع التسعين هو المكان الذي تعمل فيه القاهرة الجديدة. بيوتنا على الشارع وعلى بُعد بلوك منه داخل الأبراج الأحدث — طوابق عالية، نوافذ مزدوجة تخفّ من ضجيج الشارع، وإطلالات تمتدّ حتى الصحراء الشرقية.",
    },
    heroImage: "https://img.hostify.com/700000523/property/765570d3fb749f25ce74b1eb7dee1382-full.jpg",
    thumbnail: "https://img.hostify.com/700000523/property/ae060c506cf0f8a83804c4ad39c31c2e-full.jpg",
    homeCount: 8,
    startingNightlyEGP: 2200,
    coordinates: { lat: 30.0244, lng: 31.4569 },
    category: "urban",
  },
  // ─── Golden Gates ───────────────────────────────────────────────────────
  {
    slug: "gg-buildings",
    name: { en: "GG Buildings", ar: "عمارات جولدن جاتس" },
    area: "golden-gates",
    areaName: { en: "Golden Gates", ar: "جولدن جاتس" },
    shortPitch: {
      en: "Apartment buildings inside the Golden Gates compound — quiet, secure, and a short hop to the airport.",
      ar: "عمارات سكنية داخل كومباوند جولدن جاتس — هادئة وآمنة وعلى بُعد قصير من المطار.",
    },
    longDescription: {
      en: "Fifteen listings across a handful of mid-rise buildings inside Golden Gates. Studios up to 2-bedrooms, all with the same compound amenities — pool, gym, 24/7 security — and an in-house concierge who handles airport pickups.",
      ar: "خمسة عشر بيتًا في عدد من العمارات متوسّطة الارتفاع داخل جولدن جاتس. من الاستوديوهات إلى الغرفتين، جميعها بنفس مرافق الكومباوند — حمّام سباحة، جيم، أمن على مدار الساعة — وكونسيرج داخلي يتكفّل بالاستقبال من المطار.",
    },
    heroImage: "https://img.hostify.com/700000523/property/a5cf99356833997437dd8ad01ba77977-full.jpg",
    thumbnail: "https://img.hostify.com/700000523/property/5395529d16465dfc86aa37b6ca752aeb-full.jpg",
    homeCount: 15,
    startingNightlyEGP: 1800,
    coordinates: { lat: 30.0466, lng: 31.3567 },
    category: "compound",
  },
  {
    slug: "gg-villas",
    name: { en: "GG Villas", ar: "فيلات جولدن جاتس" },
    area: "golden-gates",
    areaName: { en: "Golden Gates", ar: "جولدن جاتس" },
    shortPitch: {
      en: "Two standalone villas inside Golden Gates — private gardens, bigger groups, slower stays.",
      ar: "فيلتان مستقلّتان داخل جولدن جاتس — حدائق خاصة، مجموعات أكبر، وإقامات أبطأ.",
    },
    longDescription: {
      en: "Two villas only — small enough that we know each one by its quirks. Private gardens, three to four bedrooms, kitchens that take a real dinner party, and a quiet cul-de-sac that stays cool into the evening.",
      ar: "فيلتان فقط — قليلتان بما يكفي لنعرف كلّ واحدة بتفاصيلها. حدائق خاصة، ثلاث إلى أربع غرف نوم، مطابخ تتّسع لعشاء حقيقي، وحارة هادئة تظلّ منعشة حتى المساء.",
    },
    heroImage: "https://img.hostify.com/700000523/property/b3be49680f10c26a03837805d337fa67-full.jpg",
    thumbnail: "https://img.hostify.com/700000523/property/cf4ef4c49e57b31844e64e009606183b-full.jpg",
    homeCount: 2,
    startingNightlyEGP: 6500,
    coordinates: { lat: 30.0498, lng: 31.3592 },
    category: "compound",
  },
  {
    slug: "nomads",
    name: { en: "Nomads", ar: "نومادز" },
    area: "golden-gates",
    areaName: { en: "Golden Gates", ar: "جولدن جاتس" },
    shortPitch: {
      en: "A long-stay project for remote workers and slow travelers — co-living energy, private apartments.",
      ar: "مشروع للإقامات الطويلة للعاملين عن بُعد ومسافري الإقامة الطويلة — طاقة كو-ليفينج بشقق خاصة.",
    },
    longDescription: {
      en: "Nomads is the sister project of GG Buildings — same compound, different proposition. Built for guests staying a month or longer: lounge spaces, a quiet co-working floor, monthly rates that work, and a community that doesn't ask too much of you.",
      ar: "نومادز هو المشروع الشقيق لعمارات جولدن جاتس — نفس الكومباوند، وعرض مختلف. مبني للضيوف الذين يقيمون شهرًا فأكثر: قاعات لاونج، طابق كو-ووركينغ هادئ، أسعار شهرية تعمل، ومجتمع لا يطلب منك الكثير.",
    },
    heroImage: "https://img.hostify.com/700000523/property/d3fe9caa8812de97a2d5ddd41ba27154-full.jpg",
    thumbnail: "https://img.hostify.com/700000523/property/8ac90c9b0165b5d24906116c8a5d75d2-full.jpg",
    homeCount: 2,
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
