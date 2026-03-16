import { Router, type IRouter } from "express";
import { venues } from "../data/venues.js";

const router: IRouter = Router();

type ChatRequestBody = {
  message?: string;
  lang?: string;
  userLat?: number | string;
  userLng?: number | string;
};

type TranslationMap = Record<string, string> & {
  default: string;
};

// POST /api/chat
// Trả lời chatbot theo từ khóa và gợi ý venue phù hợp.
router.post("/chat", (req, res) => {
  const {
    message,
    lang = "en",
    userLat,
    userLng,
  } = req.body as ChatRequestBody;

  const language = typeof lang === "string" && lang.length > 0 ? lang : "en";
  const latitude = typeof userLat === "number" ? userLat : Number(userLat);
  const longitude = typeof userLng === "number" ? userLng : Number(userLng);
  const hasCoordinates =
    Number.isFinite(latitude) && Number.isFinite(longitude);

  // Chọn bản dịch theo ngôn ngữ, fallback sang en rồi default.
  const translate = (translations: TranslationMap) => {
    return translations[language] ?? translations.en ?? translations.default;
  };

  if (!message) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  const msg = (message as string).toLowerCase();

  // Nhận diện ý định bằng regex đa ngôn ngữ.
  const isNearest =
    /nearest|near|gần|近|가까|proche|nächst|cerca|vicin|próxim|ближайш|ใกล|terdekat|नजदीक/.test(
      msg,
    );
  const isVegetarian =
    /vegetarian|vegan|chay|素|ベジ|채식|végétar|نباتي|มังสวิรัติ|sayuran|शाकाहारी/.test(
      msg,
    );
  const isOpen =
    /open|mở|营业|영업|ouvert|geöffnet|abierto|aperto|مفتوح|เปิด|buka|खुला/.test(
      msg,
    );
  const isBudget =
    /budget|cheap|giá rẻ|便宜|安い|저렴|économ|günstig|econom|اقتصاد|ราคา|terjangkau|किफाय/.test(
      msg,
    );

  const nameOf = (v: (typeof venues)[0]) => {
    const names = v.nameLocal as Record<string, string>;

    return names[language] ?? names.en ?? v.name;
  };

  const toCard = (v: (typeof venues)[0]) => ({
    id: v.id,
    name: nameOf(v),
    category: v.category,
    rating: v.rating,
    address: v.address,
    imageUrl: v.imageUrl,
    isOpen: v.isOpen,
    priceRange: v.priceRange,
  });

  let suggestedVenues: ReturnType<typeof toCard>[] = [];
  let reply = "";

  // Nhánh xử lý: đồ chay.
  if (isVegetarian) {
    suggestedVenues = venues
      .filter((v) => v.category === "vegetarian")
      .slice(0, 3)
      .map(toCard);
    reply = translate({
      vi: "Quán chay gợi ý cho bạn:",
      en: "Great vegetarian options:",
      zh: "素食推荐：",
      ja: "ベジタリアンのお店：",
      ko: "채식 옵션:",
      fr: "Options végétariennes:",
      de: "Vegetarische Optionen:",
      es: "Opciones vegetarianas:",
      default: "Great vegetarian options:",
    });
    // Nhánh xử lý: giá rẻ.
  } else if (isBudget) {
    suggestedVenues = venues
      .filter((v) => v.priceRange === "$")
      .slice(0, 3)
      .map(toCard);
    reply = translate({
      vi: "Quán ngon giá rẻ:",
      en: "Budget-friendly picks:",
      zh: "经济实惠：",
      ja: "リーズナブルなお店：",
      ko: "저렴한 식당:",
      fr: "Options économiques:",
      de: "Günstige Optionen:",
      es: "Lugares económicos:",
      default: "Budget-friendly picks:",
    });
    // Nhánh xử lý: đang mở cửa.
  } else if (isOpen) {
    suggestedVenues = venues
      .filter((v) => v.isOpen)
      .slice(0, 3)
      .map(toCard);
    reply = translate({
      vi: "Đang mở cửa:",
      en: "Open right now:",
      zh: "现在营业：",
      ja: "現在営業中：",
      ko: "지금 영업 중:",
      fr: "Ouvert maintenant:",
      de: "Jetzt geöffnet:",
      es: "Abierto ahora:",
      default: "Open right now:",
    });
    // Nhánh xử lý: quán gần nhất, cần có tọa độ người dùng.
  } else if (isNearest && hasCoordinates) {
    const R = 6371000;
    suggestedVenues = venues
      .map((v) => {
        const p1 = (latitude * Math.PI) / 180,
          p2 = (v.lat * Math.PI) / 180;
        const dp = ((v.lat - latitude) * Math.PI) / 180,
          dl = ((v.lng - longitude) * Math.PI) / 180;
        const a =
          Math.sin(dp / 2) ** 2 +
          Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
        return {
          ...v,
          _dist: R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)),
        };
      })
      .sort((a, b) => a._dist - b._dist)
      .slice(0, 3)
      .map(toCard);
    reply = translate({
      vi: "Quán gần bạn nhất:",
      en: "Nearest restaurants:",
      zh: "最近的餐厅：",
      ja: "最寄りのレストラン：",
      ko: "가장 가까운 식당:",
      fr: "Restaurants les plus proches:",
      de: "Nächste Restaurants:",
      es: "Restaurantes más cercanos:",
      default: "Nearest restaurants:",
    });
    // Nhánh mặc định: hướng dẫn người dùng cách hỏi.
  } else {
    reply = translate({
      vi: "Tôi có thể giúp bạn tìm quán ăn! Hỏi về: quán gần nhất, đồ chay, đang mở cửa, hoặc giá rẻ.",
      en: "I can help you find great food! Ask about: nearest restaurant, vegetarian, open now, or budget-friendly.",
      zh: "我可以帮您找到美食！询问：最近的餐厅、素食、正在营业或经济实惠。",
      ja: "近くのお店を見つけるお手伝いができます！最寄り、ベジタリアン、営業中、またはリーズナブルについて質問してください。",
      ko: "맛있는 음식을 찾아드릴게요! 가장 가까운, 채식, 영업 중, 저렴한 곳을 물어보세요.",
      default:
        "I can help you find great food! Ask about: nearest restaurant, vegetarian, open now, or budget-friendly.",
    });
  }

  res.json({ reply, suggestedVenues });
});

export default router;
