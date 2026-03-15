import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { useVenueDetail, fetchAudio } from "@/api";
import { useAppStore } from "@/store/use-app-store";
import { playAudioTranscript, stopAudioTranscript } from "@/lib/tts";
import { ArrowLeft, Star, MapPin, Clock, Phone, Globe, Volume2, SquareSquare } from "lucide-react";
import { ChatBox } from "@/components/chat-box";
import { motion } from "framer-motion";

export default function VenueDetail() {
  const [, params] = useRoute("/venue/:id");
  const venueId = params?.id || "";
  const { language } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: venue, isLoading, error } = useVenueDetail(venueId, language);

  useEffect(() => {
    // Cleanup TTS on unmount
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
        // Simple heuristic to toggle button state back, precise 'onend' events from SpeechSynthesis can be buggy across browsers
        setTimeout(() => setIsPlaying(false), Math.max(res.transcript.length * 70, 3000));
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
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Venue not found</h2>
        <p className="text-muted-foreground mb-6">We couldn't load the details for this location.</p>
        <Link href="/map" className="px-6 py-3 bg-primary text-white rounded-xl font-medium">Back to Map</Link>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  const todaysHours = venue.hours?.[today] || "Check with restaurant";

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Hero Image Section */}
      <div className="relative h-[40vh] md:h-[50vh] w-full">
        <img 
          src={venue.imageUrl || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&q=80"} 
          alt={venue.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        
        {/* Navigation */}
        <div className="absolute top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-center z-10">
          <Link href="/map">
            <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 text-white">
          <div className="inline-block px-3 py-1 bg-primary rounded-lg text-xs font-bold tracking-wider uppercase mb-3 shadow-lg">
            {venue.category}
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-2 shadow-sm">{venue.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/90">
            <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {venue.rating} ({venue.reviewCount} reviews)
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md">
              {venue.priceRange}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:-mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Play Audio FAB (Mobile) / Banner (Desktop) */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePlayAudio}
              className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 font-semibold text-lg shadow-xl transition-all duration-300 ${isPlaying ? 'bg-secondary text-secondary-foreground animate-pulse' : 'bg-gradient-to-r from-primary to-orange-500 text-white'}`}
            >
              <Volume2 className={`w-6 h-6 ${isPlaying ? 'animate-bounce' : ''}`} />
              {isPlaying ? "Playing Audio Guide..." : "Listen to Audio Guide"}
            </motion.button>

            {/* Description */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-border/50">
              <h2 className="text-2xl font-display font-bold mb-4 text-foreground">About</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {venue.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-6">
                {venue.tags?.map((tag, i) => (
                  <span key={i} className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-sm font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Menu */}
            {venue.menu && venue.menu.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-foreground px-2">Featured Menu</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {venue.menu.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl p-4 border border-border/50 flex gap-4 hover:shadow-md transition-shadow">
                      {item.imageUrl && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-foreground truncate pr-2">{item.name}</h4>
                          <span className="font-bold text-primary shrink-0">{item.price.toLocaleString()}đ</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {venue.reviews && venue.reviews.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-foreground px-2">Reviews</h2>
                <div className="space-y-4">
                  {venue.reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-2xl p-6 border border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-foreground">{review.author}</div>
                        <div className="flex items-center text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-muted/30'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground italic">"{review.comment}"</p>
                      <div className="text-xs text-muted-foreground/60 mt-4">{review.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Info Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-sm sticky top-6">
              <h3 className="font-display font-bold text-xl mb-6">Information</h3>
              
              <ul className="space-y-5">
                <li className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground mb-1">Address</div>
                    <div className="text-muted-foreground text-sm leading-relaxed">{venue.address}</div>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lng}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-sm font-semibold text-primary hover:underline"
                    >
                      Get Directions
                    </a>
                  </div>
                </li>
                
                <li className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground mb-1">Hours Today</div>
                    <div className="text-muted-foreground text-sm flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${venue.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {venue.isOpen ? 'Open Now' : 'Closed'} &bull; {todaysHours}
                    </div>
                  </div>
                </li>

                {venue.phone && (
                  <li className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground mb-1">Phone</div>
                      <div className="text-muted-foreground text-sm">{venue.phone}</div>
                    </div>
                  </li>
                )}

                {venue.website && (
                  <li className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground mb-1">Website</div>
                      <a href={venue.website} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline truncate block w-48">
                        {venue.website.replace('https://', '')}
                      </a>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* Gallery Mini */}
            {venue.gallery && venue.gallery.length > 0 && (
              <div className="bg-white rounded-3xl p-4 border border-border/50 shadow-sm overflow-hidden">
                <h3 className="font-display font-bold text-lg mb-3 px-2 flex items-center gap-2">
                  <SquareSquare className="w-5 h-5 text-muted-foreground" />
                  Gallery
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {venue.gallery.slice(0, 4).map((img, i) => (
                    <div key={i} className={`rounded-xl overflow-hidden ${i === 0 ? 'col-span-2 aspect-video' : 'aspect-square'}`}>
                      <img src={img} alt="Gallery" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      
      <ChatBox />
    </div>
  );
}
