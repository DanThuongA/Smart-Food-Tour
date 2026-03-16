import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { useVenueDetail, fetchAudio } from "@/api";
import { useAppStore } from "@/store/use-app-store";
import { playAudioTranscript, stopAudioTranscript } from "@/lib/tts";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  Volume2,
  Images,
  ChevronRight,
} from "lucide-react";
import { ChatBox } from "@/components/chat-box";
import { motion } from "framer-motion";

export default function VenueDetail() {
  const [, params] = useRoute("/venue/:id");
  const venueId = params?.id || "";
  const { language } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "menu" | "reviews">(
    "about",
  );

  const { data: venue, isLoading, error } = useVenueDetail(venueId, language);

  useEffect(() => {
    return () => {
      stopAudioTranscript();
    };
  }, []);

  const handlePlayAudio = async () => {
    if (isPlaying) {
      stopAudioTranscript();
      setIsPlaying(false);
      return;
    }
    try {
      setIsPlaying(true);
      const res = await fetchAudio(venueId, language);
      if (res.transcript) {
        playAudioTranscript(res.transcript, res.lang);
        setTimeout(
          () => setIsPlaying(false),
          Math.max(res.transcript.length * 70, 3000),
        );
      } else {
        setIsPlaying(false);
      }
    } catch (e) {
      console.error(e);
      setIsPlaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Venue not found
        </h2>
        <p className="text-muted-foreground mb-6">
          We couldn't load the details for this location.
        </p>
        <Link
          href="/map"
          className="px-6 py-3 bg-primary text-white rounded-xl font-medium"
        >
          Back to Map
        </Link>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
  const todaysHours = venue.hours?.[today] || "Check with restaurant";

  const tabs = [
    { id: "about" as const, label: "About" },
    { id: "menu" as const, label: "Menu" },
    { id: "reviews" as const, label: "Reviews" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* Hero */}
      <div className="relative h-[45vh] w-full overflow-hidden">
        <img
          src={
            venue.imageUrl ||
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&q=80"
          }
          alt={venue.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <Link href="/map">
            <button className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors border border-white/20">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 w-full p-5 sm:p-8 text-white">
          <span className="inline-block px-3 py-1 bg-primary/90 backdrop-blur-sm rounded-full text-xs font-bold tracking-wider uppercase mb-3">
            {venue.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
            {venue.name}
          </h1>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{venue.rating}</span>
              <span className="text-white/70">
                ({venue.reviewCount} reviews)
              </span>
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full font-medium">
              {venue.priceRange}
            </span>
            <span
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium ${venue.isOpen ? "bg-green-500/80 backdrop-blur-sm" : "bg-red-500/80 backdrop-blur-sm"}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${venue.isOpen ? "bg-green-200" : "bg-red-200"}`}
              />
              {venue.isOpen ? "Open Now" : "Closed"}
            </span>
          </div>
        </div>
      </div>

      {/* Audio Guide Banner */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-5 relative z-10 mb-6">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handlePlayAudio}
          className={`w-full py-3.5 px-6 rounded-2xl flex items-center justify-center gap-3 font-semibold text-base shadow-lg transition-all duration-300 ${
            isPlaying
              ? "bg-white border-2 border-primary text-primary"
              : "bg-gradient-to-r from-primary to-orange-500 text-white"
          }`}
        >
          <Volume2
            className={`w-5 h-5 ${isPlaying ? "animate-bounce" : ""}`}
          />
          {isPlaying ? "Playing Audio Guide..." : "🎙 Listen to Audio Guide"}
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Tabs + Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-2xl p-1 flex gap-1 shadow-sm border border-border/40">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* About Tab */}
            {activeTab === "about" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-border/40">
                  <h2 className="text-lg font-bold mb-3 text-foreground">
                    About this place
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {venue.description}
                  </p>
                  {venue.tags && venue.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/40">
                      {venue.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-primary/8 text-primary rounded-full text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Gallery inline (trong About tab) */}
                {venue.gallery && venue.gallery.length > 0 && (
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-border/40">
                    <h2 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
                      <Images className="w-5 h-5 text-primary" />
                      Gallery
                    </h2>
                    <div className="grid grid-cols-2 gap-2">
                      {venue.gallery.slice(0, 4).map((img, i) => (
                        <div
                          key={i}
                          className={`rounded-xl overflow-hidden ${i === 0 ? "col-span-2 aspect-[16/7]" : "aspect-square"}`}
                        >
                          <img
                            src={img}
                            alt={`Gallery ${i + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Menu Tab */}
            {activeTab === "menu" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {venue.menu && venue.menu.length > 0 ? (
                  <div className="space-y-3">
                    {venue.menu.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl p-4 border border-border/40 flex gap-4 hover:shadow-md transition-shadow"
                      >
                        {item.imageUrl && (
                          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-semibold text-foreground pr-2">
                              {item.name}
                            </h4>
                            <span className="font-bold text-primary shrink-0 text-sm">
                              {item.price.toLocaleString()}đ
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-8 text-center text-muted-foreground border border-border/40">
                    No menu available
                  </div>
                )}
              </motion.div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {venue.reviews && venue.reviews.length > 0 ? (
                  <div className="space-y-3">
                    {venue.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-white rounded-2xl p-5 border border-border/40"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                              {review.author.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-foreground">
                              {review.author}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          "{review.comment}"
                        </p>
                        <div className="text-xs text-muted-foreground/50 mt-3">
                          {review.date}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-8 text-center text-muted-foreground border border-border/40">
                    No reviews yet
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Right: Info Panel (no sticky) */}
          <div className="space-y-4">
            {/* Info Card */}
            <div className="bg-white rounded-2xl p-5 border border-border/40 shadow-sm">
              <h3 className="font-bold text-base mb-4 text-foreground">
                Information
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Address
                    </div>
                    <div className="text-sm text-foreground leading-relaxed">
                      {venue.address}
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      Get Directions
                      <ChevronRight className="w-3 h-3" />
                    </a>
                  </div>
                </li>

                <li className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Hours Today
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-foreground">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${venue.isOpen ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <span className="font-medium">
                        {venue.isOpen ? "Open" : "Closed"}
                      </span>
                      <span className="text-muted-foreground">
                        · {todaysHours}
                      </span>
                    </div>
                  </div>
                </li>

                {venue.phone && (
                  <li className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Phone
                      </div>
                      <a
                        href={`tel:${venue.phone}`}
                        className="text-sm text-foreground hover:text-primary transition-colors"
                      >
                        {venue.phone}
                      </a>
                    </div>
                  </li>
                )}

                {venue.website && (
                  <li className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                      <Globe className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Website
                      </div>
                      <a
                        href={venue.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline truncate block"
                      >
                        {venue.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* Quick Rating Summary */}
            <div className="bg-white rounded-2xl p-5 border border-border/40 shadow-sm">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-1">
                  {venue.rating}
                </div>
                <div className="flex justify-center gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(Number(venue.rating)) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`}
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  {venue.reviewCount} reviews
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChatBox />
    </div>
  );
}
