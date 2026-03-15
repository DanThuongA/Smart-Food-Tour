import { venues } from "../data/venues.js";

interface ChatRequest {
  message: string;
  lang: string;
  userLat?: number;
  userLng?: number;
  context?: string;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dPhi = ((lat2 - lat1) * Math.PI) / 180;
  const dLambda = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const responses: Record<string, Record<string, string>> = {
  nearest: {
    vi: "Đây là những quán ăn gần bạn nhất:",
    en: "Here are the nearest restaurants to you:",
    zh: "以下是离您最近的餐厅：",
    ja: "あなたの近くにあるレストランです：",
    ko: "가장 가까운 식당입니다:",
    fr: "Voici les restaurants les plus proches de vous :",
    de: "Hier sind die nächsten Restaurants in Ihrer Nähe:",
    es: "Estos son los restaurantes más cercanos a usted:",
    it: "Ecco i ristoranti più vicini a te:",
    pt: "Aqui estão os restaurantes mais próximos de você:",
    ru: "Вот ближайшие к вам рестораны:",
    ar: "إليك أقرب المطاعم إليك:",
    th: "นี่คือร้านอาหารที่ใกล้คุณที่สุด:",
    id: "Berikut adalah restoran terdekat dengan Anda:",
    hi: "यहाँ आपके सबसे नजदीकी रेस्तरां हैं:"
  },
  vegetarian: {
    vi: "Chúng tôi có quán chay tuyệt vời cho bạn:",
    en: "We have great vegetarian options for you:",
    zh: "我们为您提供很棒的素食选择：",
    ja: "素晴らしいベジタリアンオプションをご用意しています：",
    ko: "훌륭한 채식 옵션이 있습니다:",
    fr: "Nous avons d'excellentes options végétariennes pour vous :",
    de: "Wir haben tolle vegetarische Optionen für Sie:",
    es: "Tenemos excelentes opciones vegetarianas para usted:",
    it: "Abbiamo ottime opzioni vegetariane per te:",
    pt: "Temos ótimas opções vegetarianas para você:",
    ru: "У нас есть отличные вегетарианские варианты для вас:",
    ar: "لدينا خيارات نباتية رائعة لك:",
    th: "เรามีตัวเลือกมังสวิรัติที่ยอดเยี่ยมสำหรับคุณ:",
    id: "Kami memiliki pilihan vegetarian yang bagus untuk Anda:",
    hi: "हमारे पास आपके लिए बढ़िया शाकाहारी विकल्प हैं:"
  },
  open: {
    vi: "Các quán đang mở cửa ngay lúc này:",
    en: "Restaurants that are open right now:",
    zh: "现在营业的餐厅：",
    ja: "現在営業中のレストラン：",
    ko: "지금 영업 중인 식당:",
    fr: "Restaurants ouverts en ce moment :",
    de: "Jetzt geöffnete Restaurants:",
    es: "Restaurantes abiertos ahora mismo:",
    it: "Ristoranti aperti in questo momento:",
    pt: "Restaurantes abertos agora:",
    ru: "Рестораны, открытые прямо сейчас:",
    ar: "المطاعم المفتوحة الآن:",
    th: "ร้านอาหารที่เปิดอยู่ตอนนี้:",
    id: "Restoran yang sedang buka sekarang:",
    hi: "अभी खुले रेस्तरां:"
  },
  budget: {
    vi: "Những quán ngon, giá phải chăng:",
    en: "Great food at budget-friendly prices:",
    zh: "物美价廉的餐厅：",
    ja: "お手頃価格の美味しいレストラン：",
    ko: "합리적인 가격의 맛있는 식당:",
    fr: "De bonne nourriture à des prix abordables :",
    de: "Gutes Essen zu günstigen Preisen:",
    es: "Buena comida a precios accesibles:",
    it: "Ottimo cibo a prezzi convenienti:",
    pt: "Boa comida a preços acessíveis:",
    ru: "Вкусная еда по доступным ценам:",
    ar: "طعام رائع بأسعار معقولة:",
    th: "อาหารอร่อยราคาประหยัด:",
    id: "Makanan enak dengan harga terjangkau:",
    hi: "किफायती कीमतों पर बेहतरीन खाना:"
  },
  default: {
    vi: "Tôi có thể giúp bạn tìm quán ăn ngon gần đây! Hãy thử hỏi về: quán gần nhất, đồ chay, đang mở cửa, hoặc giá rẻ.",
    en: "I can help you find great food nearby! Try asking about: nearest restaurant, vegetarian options, open now, or budget-friendly places.",
    zh: "我可以帮您找到附近的美食！尝试询问：最近的餐厅、素食选项、正在营业或经济实惠的地方。",
    ja: "近くの美味しいお店を見つけるお手伝いができます！最寄りのレストラン、ベジタリアンオプション、現在営業中、またはリーズナブルなお店について質問してみてください。",
    ko: "근처에서 맛있는 음식을 찾는 데 도움을 드릴 수 있습니다! 가장 가까운 식당, 채식 옵션, 지금 영업 중, 또는 저렴한 곳에 대해 물어보세요.",
    fr: "Je peux vous aider à trouver de bons restaurants à proximité! Essayez de demander: restaurant le plus proche, options végétariennes, ouvert maintenant ou endroits économiques.",
    de: "Ich kann Ihnen helfen, gutes Essen in der Nähe zu finden! Fragen Sie nach: nächstes Restaurant, vegetarische Optionen, jetzt geöffnet oder preisgünstige Orte.",
    es: "¡Puedo ayudarte a encontrar buena comida cerca! Prueba preguntar sobre: restaurante más cercano, opciones vegetarianas, abierto ahora o lugares económicos.",
    it: "Posso aiutarti a trovare ottimo cibo nelle vicinanze! Prova a chiedere di: ristorante più vicino, opzioni vegetariane, aperto ora o posti economici.",
    pt: "Posso ajudá-lo a encontrar boa comida por perto! Tente perguntar sobre: restaurante mais próximo, opções vegetarianas, aberto agora ou lugares econômicos.",
    ru: "Я могу помочь вам найти вкусную еду поблизости! Попробуйте спросить о: ближайшем ресторане, вегетарианских вариантах, работающих сейчас или доступных местах.",
    ar: "يمكنني مساعدتك في العثور على طعام رائع بالقرب منك! حاول السؤال عن: أقرب مطعم، خيارات نباتية، مفتوح الآن، أو أماكن بأسعار معقولة.",
    th: "ฉันสามารถช่วยคุณหาอาหารอร่อยใกล้ๆ ได้! ลองถามเกี่ยวกับ: ร้านอาหารใกล้ที่สุด ตัวเลือกมังสวิรัติ เปิดอยู่ตอนนี้ หรือสถานที่ราคาประหยัด",
    id: "Saya bisa membantu Anda menemukan makanan enak di sekitar Anda! Coba tanyakan tentang: restoran terdekat, pilihan vegetarian, buka sekarang, atau tempat yang terjangkau.",
    hi: "मैं आपके पास अच्छा खाना खोजने में मदद कर सकता हूँ! पूछने की कोशिश करें: सबसे नजदीकी रेस्तरां, शाकाहारी विकल्प, अभी खुला है, या किफायती जगहें।"
  }
};

const quickRepliesMap: Record<string, string[]> = {
  vi: ["Quán gần nhất", "Đồ chay", "Đang mở cửa", "Giá rẻ"],
  en: ["Nearest restaurant", "Vegetarian options", "Open now", "Budget-friendly"],
  zh: ["最近的餐厅", "素食选项", "现在营业", "经济实惠"],
  ja: ["最寄りのレストラン", "ベジタリアン", "現在営業中", "リーズナブル"],
  ko: ["가장 가까운 식당", "채식 옵션", "지금 영업 중", "저렴한 곳"],
  fr: ["Restaurant le plus proche", "Options végétariennes", "Ouvert maintenant", "Économique"],
  de: ["Nächstes Restaurant", "Vegetarisch", "Jetzt geöffnet", "Günstig"],
  es: ["Restaurante más cercano", "Opciones vegetarianas", "Abierto ahora", "Económico"],
  it: ["Ristorante più vicino", "Vegetariano", "Aperto ora", "Economico"],
  pt: ["Restaurante mais próximo", "Vegetariano", "Aberto agora", "Econômico"],
  ru: ["Ближайший ресторан", "Вегетарианское", "Открыто сейчас", "Бюджетно"],
  ar: ["أقرب مطعم", "خيارات نباتية", "مفتوح الآن", "اقتصادي"],
  th: ["ร้านใกล้ที่สุด", "มังสวิรัติ", "เปิดอยู่", "ราคาประหยัด"],
  id: ["Restoran terdekat", "Pilihan vegetarian", "Buka sekarang", "Terjangkau"],
  hi: ["नजदीकी रेस्तरां", "शाकाहारी विकल्प", "अभी खुला", "किफायती"]
};

export function processChatMessage(req: ChatRequest) {
  const { message, lang, userLat, userLng } = req;
  const msg = message.toLowerCase();
  const quickReplies = quickRepliesMap[lang] || quickRepliesMap["en"];

  const isNearest = msg.includes("nearest") || msg.includes("near") || msg.includes("gần") || msg.includes("近") || msg.includes("近く") || msg.includes("가까") || msg.includes("proche") || msg.includes("nächst") || msg.includes("cerca") || msg.includes("vicin") || msg.includes("próxim") || msg.includes("ближайш") || msg.includes("ใกล") || msg.includes("terdekat") || msg.includes("नजदीक");
  const isVegetarian = msg.includes("vegetarian") || msg.includes("vegan") || msg.includes("chay") || msg.includes("素") || msg.includes("ベジ") || msg.includes("채식") || msg.includes("végétar") || msg.includes("vegetar") || msg.includes("نباتي") || msg.includes("มังสวิรัติ") || msg.includes("sayuran") || msg.includes("शाकाहारी");
  const isOpen = msg.includes("open") || msg.includes("mở") || msg.includes("营业") || msg.includes("営業") || msg.includes("영업") || msg.includes("ouvert") || msg.includes("geöffnet") || msg.includes("abierto") || msg.includes("aperto") || msg.includes("مفتوح") || msg.includes("เปิด") || msg.includes("buka") || msg.includes("खुला");
  const isBudget = msg.includes("budget") || msg.includes("cheap") || msg.includes("giá rẻ") || msg.includes("便宜") || msg.includes("安い") || msg.includes("저렴") || msg.includes("économ") || msg.includes("günstig") || msg.includes("econom") || msg.includes("اقتصاد") || msg.includes("ราคา") || msg.includes("terjangkau") || msg.includes("किफाय");

  let reply = "";
  let suggestedVenues: any[] = [];

  if (isVegetarian) {
    reply = responses.vegetarian[lang] || responses.vegetarian["en"];
    suggestedVenues = venues
      .filter((v) => v.category === "vegetarian")
      .slice(0, 3)
      .map((v) => {
        const nameLocal = (v.nameLocal as Record<string, string>) || {};
        return { id: v.id, name: nameLocal[lang] || nameLocal["en"] || v.name, category: v.category, lat: v.lat, lng: v.lng, address: v.address, rating: v.rating, imageUrl: v.imageUrl, isOpen: v.isOpen, audioRadius: v.audioRadius, priceRange: v.priceRange };
      });
  } else if (isBudget) {
    reply = responses.budget[lang] || responses.budget["en"];
    suggestedVenues = venues
      .filter((v) => v.priceRange === "$")
      .slice(0, 3)
      .map((v) => {
        const nameLocal = (v.nameLocal as Record<string, string>) || {};
        return { id: v.id, name: nameLocal[lang] || nameLocal["en"] || v.name, category: v.category, lat: v.lat, lng: v.lng, address: v.address, rating: v.rating, imageUrl: v.imageUrl, isOpen: v.isOpen, audioRadius: v.audioRadius, priceRange: v.priceRange };
      });
  } else if (isOpen) {
    reply = responses.open[lang] || responses.open["en"];
    suggestedVenues = venues
      .filter((v) => v.isOpen)
      .slice(0, 3)
      .map((v) => {
        const nameLocal = (v.nameLocal as Record<string, string>) || {};
        return { id: v.id, name: nameLocal[lang] || nameLocal["en"] || v.name, category: v.category, lat: v.lat, lng: v.lng, address: v.address, rating: v.rating, imageUrl: v.imageUrl, isOpen: v.isOpen, audioRadius: v.audioRadius, priceRange: v.priceRange };
      });
  } else if (isNearest && userLat && userLng) {
    reply = responses.nearest[lang] || responses.nearest["en"];
    suggestedVenues = venues
      .map((v) => ({
        ...v,
        distance: haversineDistance(userLat, userLng, v.lat, v.lng)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
      .map((v) => {
        const nameLocal = (v.nameLocal as Record<string, string>) || {};
        return { id: v.id, name: nameLocal[lang] || nameLocal["en"] || v.name, category: v.category, lat: v.lat, lng: v.lng, address: v.address, rating: v.rating, imageUrl: v.imageUrl, isOpen: v.isOpen, audioRadius: v.audioRadius, priceRange: v.priceRange };
      });
  } else {
    reply = responses.default[lang] || responses.default["en"];
  }

  return { reply, suggestedVenues, quickReplies };
}
