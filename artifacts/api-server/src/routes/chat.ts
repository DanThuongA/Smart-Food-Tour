import { Router, type IRouter } from "express";
import { venues } from "../data/venues.js";

const router: IRouter = Router();

// POST /api/chat
router.post("/chat", (req, res) => {
  const { message, lang = "en", userLat, userLng } = req.body;

  if (!message) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  const msg = (message as string).toLowerCase();

  const isNearest = /nearest|near|gần|近|가까|proche|nächst|cerca|vicin|próxim|ближайш|ใกล|terdekat|नजदीक/.test(msg);
  const isVegetarian = /vegetarian|vegan|chay|素|ベジ|채식|végétar|نباتي|มังสวิรัติ|sayuran|शाकाहारी/.test(msg);
  const isOpen = /open|mở|营业|영업|ouvert|geöffnet|abierto|aperto|مفتوح|เปิด|buka|खुला/.test(msg);
  const isBudget = /budget|cheap|giá rẻ|便宜|安い|저렴|économ|günstig|econom|اقتصاد|ราคา|terjangkau|किफाय/.test(msg);

  const nameOf = (v: typeof venues[0]) => ((v.nameLocal as Record<string, string>)[lang] || (v.nameLocal as Record<string, string>)["en"] || v.name);

  const toCard = (v: typeof venues[0]) => ({
    id: v.id, name: nameOf(v), category: v.category, rating: v.rating,
    address: v.address, imageUrl: v.imageUrl, isOpen: v.isOpen, priceRange: v.priceRange
  });

  let suggestedVenues: ReturnType<typeof toCard>[] = [];
  let reply = "";

  if (isVegetarian) {
    suggestedVenues = venues.filter(v => v.category === "vegetarian").slice(0, 3).map(toCard);
    reply = { vi: "Quán chay gợi ý cho bạn:", en: "Great vegetarian options:", zh: "素食推荐：", ja: "ベジタリアンのお店：", ko: "채식 옵션:", fr: "Options végétariennes:", de: "Vegetarische Optionen:", es: "Opciones vegetarianas:", default: "Great vegetarian options:" }[lang] || "Great vegetarian options:";
  } else if (isBudget) {
    suggestedVenues = venues.filter(v => v.priceRange === "$").slice(0, 3).map(toCard);
    reply = { vi: "Quán ngon giá rẻ:", en: "Budget-friendly picks:", zh: "经济实惠：", ja: "リーズナブルなお店：", ko: "저렴한 식당:", fr: "Options économiques:", de: "Günstige Optionen:", es: "Lugares económicos:", default: "Budget-friendly picks:" }[lang] || "Budget-friendly picks:";
  } else if (isOpen) {
    suggestedVenues = venues.filter(v => v.isOpen).slice(0, 3).map(toCard);
    reply = { vi: "Đang mở cửa:", en: "Open right now:", zh: "现在营业：", ja: "現在営業中：", ko: "지금 영업 중:", fr: "Ouvert maintenant:", de: "Jetzt geöffnet:", es: "Abierto ahora:", default: "Open right now:" }[lang] || "Open right now:";
  } else if (isNearest && userLat && userLng) {
    const R = 6371000;
    suggestedVenues = venues
      .map(v => {
        const p1 = (userLat * Math.PI) / 180, p2 = (v.lat * Math.PI) / 180;
        const dp = ((v.lat - userLat) * Math.PI) / 180, dl = ((v.lng - userLng) * Math.PI) / 180;
        const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
        return { ...v, _dist: R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) };
      })
      .sort((a, b) => a._dist - b._dist)
      .slice(0, 3)
      .map(toCard);
    reply = { vi: "Quán gần bạn nhất:", en: "Nearest restaurants:", zh: "最近的餐厅：", ja: "最寄りのレストラン：", ko: "가장 가까운 식당:", fr: "Restaurants les plus proches:", de: "Nächste Restaurants:", es: "Restaurantes más cercanos:", default: "Nearest restaurants:" }[lang] || "Nearest restaurants:";
  } else {
    reply = {
      vi: "Tôi có thể giúp bạn tìm quán ăn! Hỏi về: quán gần nhất, đồ chay, đang mở cửa, hoặc giá rẻ.",
      en: "I can help you find great food! Ask about: nearest restaurant, vegetarian, open now, or budget-friendly.",
      zh: "我可以帮您找到美食！询问：最近的餐厅、素食、正在营业或经济实惠。",
      ja: "近くのお店を見つけるお手伝いができます！最寄り、ベジタリアン、営業中、またはリーズナブルについて質問してください。",
      ko: "맛있는 음식을 찾아드릴게요! 가장 가까운, 채식, 영업 중, 저렴한 곳을 물어보세요.",
      default: "I can help you find great food! Ask about: nearest restaurant, vegetarian, open now, or budget-friendly.",
    }[lang] || "I can help you find great food! Ask about: nearest restaurant, vegetarian, open now, or budget-friendly.";
  }

  res.json({ reply, suggestedVenues });
});

export default router;
