import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  MapPin, Crosshair, Navigation2, Search, Filter, 
  Phone, Star, Droplet, Store, Compass, RefreshCw, ChevronRight
} from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    L: any;
  }
}

interface MapResource {
  id: string;
  name: string;
  address: string;
  type: string; // "hospital" | "blood_bank" | "pharmacy"
  lat: number;
  lng: number;
  phone: string;
  beds?: string;
  services?: string;
  rating?: number;
  distance?: number;
}

export default function MapPage() {
  const { t } = useLanguage();

  const [mapLoaded, setMapLoaded] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "hospital" | "blood" | "pharmacy">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [resources, setResources] = useState<MapResource[]>([]);
  const [nearestResource, setNearestResource] = useState<MapResource | null>(null);
  
  // Geolocation
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [tracking, setTracking] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);

  // Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Fetch all resources from database APIs
  const fetchResources = async () => {
    try {
      const [hospRes, bloodRes, pharmRes] = await Promise.all([
        fetch("/api/hospitals"),
        fetch("/api/blood-banks"),
        fetch("/api/pharmacy/stores")
      ]);

      const hospitals = hospRes.ok ? await hospRes.json() : [];
      const bloodBanks = bloodRes.ok ? await bloodRes.json() : [];
      const pharmacies = pharmRes.ok ? await pharmRes.json() : [];

      const formattedHospitals: MapResource[] = hospitals.map((h: any) => ({
        id: h.id,
        name: h.name,
        address: h.address,
        type: "hospital",
        lat: h.lat,
        lng: h.lng,
        phone: h.phone,
        beds: h.beds,
        services: h.services,
        rating: h.rating
      }));

      const formattedBlood: MapResource[] = bloodBanks.map((b: any) => ({
        id: b.id,
        name: b.name,
        address: b.address,
        type: "blood",
        lat: b.lat,
        lng: b.lng,
        phone: b.phone
      }));

      const formattedPharm: MapResource[] = pharmacies.map((p: any) => ({
        id: p.id,
        name: p.name,
        address: p.address,
        type: "pharmacy",
        lat: p.lat,
        lng: p.lng,
        phone: p.phone
      }));

      setResources([...formattedHospitals, ...formattedBlood, ...formattedPharm]);
    } catch (err) {
      console.error("Failed to load map resource database", err);
    }
  };

  // 1. Load Leaflet script and stylesheet from unpkg CDN
  useEffect(() => {
    // Prevent double injection
    if (window.L) {
      setMapLoaded(true);
      return;
    }

    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(cssLink);

    const jsScript = document.createElement("script");
    jsScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    jsScript.async = true;
    jsScript.onload = () => {
      setMapLoaded(true);
    };
    document.body.appendChild(jsScript);

    fetchResources();

    return () => {
      // Cleanups if needed
    };
  }, []);

  // 2. Initialize Map once Leaflet is loaded
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || mapRef.current) return;

    // Center map around New Delhi default
    const map = window.L.map(mapContainerRef.current, {
      zoomControl: false
    }).setView([28.6139, 77.2090], 11);

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    window.L.control.zoom({ position: "topright" }).addTo(map);

    mapRef.current = map;
    markersGroupRef.current = window.L.layerGroup().addTo(map);
  }, [mapLoaded]);

  // Acquire user GPS coordinates
  const handleGPSAcquisition = () => {
    if (!navigator.geolocation) {
      toast.error("GPS Geolocation is not supported by your browser.");
      return;
    }

    setTracking(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLat(lat);
        setUserLng(lng);
        setTracking(false);

        toast.success("Location acquired successfully!");
        
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 13);

          // Add user current location blue marker circle
          const userIcon = window.L.divIcon({
            html: `<div class="relative w-6 h-6 flex items-center justify-center bg-primary/20 border-2 border-primary rounded-full"><div class="w-2.5 h-2.5 bg-primary rounded-full animate-ping"></div></div>`,
            className: "custom-user-marker",
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          window.L.marker([lat, lng], { icon: userIcon })
            .addTo(mapRef.current)
            .bindPopup("<b>You are here</b>")
            .openPopup();
        }
      },
      (err) => {
        setTracking(false);
        toast.error("Failed to acquire location. Centering default Delhi coordinate.");
      }
    );
  };

  // 3. Render markers based on filter, search and distance calculations
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current || resources.length === 0) return;

    // Clear existing markers
    markersGroupRef.current.clearLayers();
    if (routeLineRef.current) {
      mapRef.current.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    // Filter resources
    let filtered = resources;
    if (filterType !== "all") {
      filtered = resources.filter(r => r.type === filterType);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(q) || 
        r.address.toLowerCase().includes(q)
      );
    }

    // Calculate distance and sort if user coordinates exist
    if (userLat !== null && userLng !== null) {
      filtered = filtered.map(r => ({
        ...r,
        distance: calculateDistance(userLat, userLng, r.lat, r.lng)
      }));
      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));

      if (filtered.length > 0) {
        const nearest = filtered[0];
        setNearestResource(nearest);

        // Draw polyline route to nearest resource
        const routePoints = [
          [userLat, userLng],
          [nearest.lat, nearest.lng]
        ];
        
        routeLineRef.current = window.L.polyline(routePoints, {
          color: "#3B82F6",
          weight: 4,
          opacity: 0.8,
          dashArray: "6, 8"
        }).addTo(mapRef.current);

        mapRef.current.fitBounds(routeLineRef.current.getBounds(), { padding: [50, 50] });
      }
    } else {
      setNearestResource(null);
    }

    // Place remaining markers
    filtered.forEach(r => {
      let iconColor = "#EF4444"; // default red
      let iconHtml = `<div class="p-1.5 rounded-full bg-red-500 text-white border-2 border-white shadow-md"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></div>`; // Hospital heart icon
      
      if (r.type === "blood") {
        iconColor = "#F59E0B";
        iconHtml = `<div class="p-1.5 rounded-full bg-amber-500 text-white border-2 border-white shadow-md"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7Z"/></svg></div>`;
      } else if (r.type === "pharmacy") {
        iconColor = "#10B981";
        iconHtml = `<div class="p-1.5 rounded-full bg-emerald-500 text-white border-2 border-white shadow-md"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`;
      }

      const customIcon = window.L.divIcon({
        html: iconHtml,
        className: "custom-leaflet-pin",
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      });

      const marker = window.L.marker([r.lat, r.lng], { icon: customIcon })
        .bindPopup(`
          <div class="p-1.5 text-xs text-slate-800">
            <h4 class="font-extrabold text-sm mb-1">${r.name}</h4>
            <p class="text-slate-500 leading-normal mb-1.5">${r.address}</p>
            ${r.phone ? `<div class="flex items-center gap-1">📞 <b>${r.phone}</b></div>` : ''}
            ${r.beds ? `<div class="mt-1 font-bold text-red-500">Beds: ${r.beds}</div>` : ''}
          </div>
        `);
      
      markersGroupRef.current.addLayer(marker);
    });

  }, [resources, filterType, searchQuery, userLat, userLng]);

  const focusResource = (res: MapResource) => {
    if (mapRef.current) {
      mapRef.current.setView([res.lat, res.lng], 15);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />

      <div className="pt-24 pb-16 flex-grow flex flex-col h-[90vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex flex-col w-full">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-extrabold flex items-center gap-1.5 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                <Compass className="w-8 h-8 text-primary animate-pulse" />
                Interactive Healthcare Map
              </h1>
              <p className="text-xs text-foreground/50">
                Live geolocation tracking & proximity routing index maps.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={handleGPSAcquisition}
                disabled={tracking}
                className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl font-bold flex items-center gap-1.5 hover:bg-primary/20 transition-all cursor-pointer"
              >
                <Crosshair className={`w-3.5 h-3.5 ${tracking ? "animate-spin" : ""}`} />
                {userLat ? "GPS Acquired" : "Acquire Current GPS"}
              </button>
            </div>
          </div>

          <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 h-[70vh]">
            
            {/* Map Frame Container */}
            <div className="lg:col-span-8 rounded-3xl overflow-hidden border border-border shadow-lg relative h-[400px] lg:h-full">
              {!mapLoaded ? (
                <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-white text-xs gap-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                  Loading Interactive Map Components...
                </div>
              ) : (
                <div ref={mapContainerRef} className="w-full h-full z-10" />
              )}

              {/* Floating Map Panel controls */}
              <div className="absolute top-4 left-4 z-20 flex gap-2">
                <select 
                  value={filterType}
                  onChange={(e: any) => setFilterType(e.target.value)}
                  className="bg-white/95 dark:bg-slate-900/95 border border-border text-xs rounded-lg px-3 py-1.5 font-bold outline-none shadow-md"
                >
                  <option value="all">All Registries</option>
                  <option value="hospital">Hospitals</option>
                  <option value="blood">Blood Banks</option>
                  <option value="pharmacy">Pharmacies</option>
                </select>
              </div>

              {/* Floating Nearest Card display */}
              <AnimatePresence>
                {nearestResource && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute bottom-4 left-4 right-4 sm:left-4 sm:right-auto z-20 max-w-sm w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-primary/30 p-4 rounded-2xl shadow-xl flex gap-3"
                  >
                    <div className="p-2 rounded-xl bg-primary/10 text-primary self-start mt-1">
                      <Navigation2 className="w-5 h-5 text-primary rotate-45" />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="text-[9px] font-black uppercase text-primary tracking-wider">Closest Emergency Target</div>
                      <h4 className="font-extrabold text-sm text-foreground mt-0.5">{nearestResource.name}</h4>
                      <p className="text-[10px] text-foreground/60 truncate mt-0.5">{nearestResource.address}</p>
                      
                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded text-[10px]">
                          Proximity: {nearestResource.distance?.toFixed(1)} km
                        </span>
                        <span className="text-[10px] text-foreground/50">
                          Est. Time: ~{Math.round((nearestResource.distance || 0) * 2.5)} mins
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Side list finder */}
            <div className="lg:col-span-4 flex flex-col gap-4 h-[400px] lg:h-full">
              
              {/* Search text field */}
              <div className="bg-white/40 dark:bg-slate-800/40 border border-border/80 px-4 py-3 rounded-2xl flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                <input
                  type="text"
                  placeholder="Filter by facility name or region..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow bg-transparent text-xs font-semibold outline-none text-foreground placeholder-foreground/45"
                />
              </div>

              {/* Resource grid list */}
              <div className="flex-grow overflow-y-auto border border-border/60 rounded-3xl p-3 bg-black/5 dark:bg-white/5 space-y-2.5 max-h-[300px] lg:max-h-none">
                {resources
                  .filter(r => {
                    const matchF = filterType === "all" || r.type === filterType;
                    const matchQ = !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.address.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchF && matchQ;
                  })
                  .slice(0, 15)
                  .map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => focusResource(item)}
                      className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-border/40 hover:border-primary/50 transition-all flex justify-between items-center cursor-pointer group hover:shadow-sm"
                    >
                      <div className="text-xs">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-foreground group-hover:text-primary transition-colors">{item.name}</h4>
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                            item.type === "hospital" ? "bg-red-500/10 text-red-500" :
                            item.type === "blood" ? "bg-amber-500/10 text-amber-500" :
                            "bg-emerald-500/10 text-emerald-500"
                          }`}>
                            {item.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-foreground/50 truncate max-w-[200px] mt-0.5">{item.address}</p>
                      </div>
                      
                      <div className="text-right text-[10px] text-foreground/50 font-bold">
                        {item.distance !== undefined ? (
                          <span className="text-primary font-bold">{item.distance.toFixed(1)} km</span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-foreground/30 group-hover:text-primary transition-colors" />
                        )}
                      </div>
                    </div>
                  ))}
              </div>

            </div>

          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
