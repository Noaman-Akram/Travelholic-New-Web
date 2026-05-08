import type { Experience } from "./types";

// REVIEW: copy
export const experiences: Experience[] = [
  {
    slug: "concierge",
    title: { en: "Concierge", ar: "كونسيرج" },
    category: "concierge",
    icon: "concierge-bell",
    description: {
      en: "A real person, on WhatsApp, in your time zone — for restaurant tables, doctors, last-minute flowers.",
      ar: "شخص حقيقي، على واتساب، في توقيتك — لحجوزات المطاعم، الأطباء، وزهور اللحظة الأخيرة.",
    },
    image: "https://picsum.photos/seed/th-exp-concierge/1200/900",
  },
  {
    slug: "airport-pickup",
    title: { en: "Airport pickup", ar: "استقبال من المطار" },
    category: "transport",
    icon: "car",
    description: {
      en: "Black cars, fixed pricing, English-speaking drivers. From Cairo, Alex, or Hurghada airports.",
      ar: "سيارات سوداء، سعر ثابت، سائقون يتحدّثون الإنجليزية. من مطارات القاهرة والإسكندرية والغردقة.",
    },
    image: "https://picsum.photos/seed/th-exp-airport/1200/900",
  },
  {
    slug: "in-stay-housekeeping",
    title: { en: "In-stay housekeeping", ar: "تنظيف خلال الإقامة" },
    category: "wellness",
    icon: "sparkles",
    description: {
      en: "Daily, every-other-day, or weekly — set a rhythm that fits your stay.",
      ar: "يوميًا أو يومًا بعد يوم أو أسبوعيًا — اضبط الإيقاع الذي يناسب إقامتك.",
    },
    image: "https://picsum.photos/seed/th-exp-housekeeping/1200/900",
  },
  {
    slug: "smart-check-in",
    title: { en: "Smart check-in", ar: "تسجيل دخول ذكي" },
    category: "concierge",
    icon: "key-round",
    description: {
      en: "Mobile key via the app. Backup keypad code. Check in at 3 a.m. without waking anyone.",
      ar: "مفتاح عبر التطبيق. كود لوحة احتياطي. سجّل دخولك الساعة الثالثة فجرًا بلا إزعاج لأحد.",
    },
    image: "https://picsum.photos/seed/th-exp-checkin/1200/900",
  },
  {
    slug: "private-tours",
    title: { en: "Private tours", ar: "جولات خاصة" },
    category: "culture",
    icon: "map",
    description: {
      en: "Half-day pyramids, full-day Coptic Cairo, or a quiet evening on the Khan El Khalili rooftops — set up by the team.",
      ar: "نصف يوم في الأهرامات، يوم كامل في القاهرة القبطية، أو مساء هادئ على أسطح خان الخليلي — يرتّبها الفريق.",
    },
    image: "https://picsum.photos/seed/th-exp-tours/1200/900",
  },
  {
    slug: "corporate-stays",
    title: { en: "Corporate stays", ar: "إقامات الشركات" },
    category: "corporate",
    icon: "briefcase",
    description: {
      en: "Block-bookings, dedicated invoicing, full kitchens, fast Wi-Fi, and a single point of contact for the whole team.",
      ar: "حجوزات جماعية، فواتير مخصّصة، مطابخ كاملة، واي فاي سريع، ونقطة تواصل واحدة للفريق كلّه.",
    },
    image: "https://picsum.photos/seed/th-exp-corporate/1200/900",
  },
  {
    slug: "long-stay",
    title: { en: "Long stays", ar: "إقامات طويلة" },
    category: "long-stay",
    icon: "calendar-days",
    description: {
      en: "Weekly and monthly rates auto-applied at booking. Up to 22% off for 30+ nights.",
      ar: "أسعار أسبوعية وشهرية تُطبَّق تلقائيًا عند الحجز. خصم يصل إلى ٢٢٪ للإقامات ٣٠ ليلة فأكثر.",
    },
    image: "https://picsum.photos/seed/th-exp-longstay/1200/900",
  },
  {
    slug: "wellness",
    title: { en: "In-home wellness", ar: "عافية في البيت" },
    category: "wellness",
    icon: "leaf",
    description: {
      en: "Vetted in-home massage, yoga, and personal training — booked through the app, billed to your stay.",
      ar: "مساج وبيلاتيس ويوغا وتدريب شخصي في البيت من فريق موثوق — يُحجز من التطبيق، تُدمج الفاتورة في إقامتك.",
    },
    image: "https://picsum.photos/seed/th-exp-wellness/1200/900",
  },
];
