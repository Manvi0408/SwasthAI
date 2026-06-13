import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
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
  const { theme } = useTheme();

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
  const tileLayerRef = useRef<any>(null);
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

    window.L.control.zoom({ position: "topright" }).addTo(map);

    mapRef.current = map;
    markersGroupRef.current = window.L.layerGroup().addTo(map);
  }, [mapLoaded]);

  // 3. Manage Tile Layer dynamically based on theme
  useEffect(() => {
    if (!mapRef.current) return;

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    const tileUrl = theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const tileLayer = window.L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: theme === "dark"
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    tileLayer.addTo(mapRef.current);
    tileLayerRef.current = tileLayer;
  }, [theme, mapLoaded]);

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
            html: `<div class="relative w-6 h-6 flex items-center justify-center bg-accent/20 border-2 border-accent rounded-full"><div class="w-2 h-2 bg-accent rounded-full animate-ping"></div></div>`,
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
          color: "#2563eb",
          weight: 3,
          opacity: 0.8,
          dashArray: "4, 6"
        }).addTo(mapRef.current);

        mapRef.current.fitBounds(routeLineRef.current.getBounds(), { padding: [50, 50] });
      }
    } else {
      setNearestResource(null);
    }

    // Place remaining markers
    filtered.forEach(r => {
      let iconHtml = `<div class="p-1 rounded-full bg-red-655 text-white border-2 border-white shadow-sm flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></div>`;
      
      if (r.type === "blood") {
        iconHtml = `<div class="p-1 rounded-full bg-amber-500 text-white border-2 border-white shadow-sm flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7Z"/></svg></div>`;
      } else if (r.type === "pharmacy") {
        iconHtml = `<div class="p-1 rounded-full bg-emerald-500 text-white border-2 border-white shadow-sm flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`;
      }

      const customIcon = window.L.divIcon({
        html: iconHtml,
        className: "custom-leaflet-pin",
        iconSize: [24, 24],
        iconAnchor: [12, 24]
      });

      const marker = window.L.marker([r.lat, r.lng], { icon: customIcon })
        .bindPopup(`
          <div class="p-1 text-xs text-zinc-900 font-sans">
            <h4 class="font-bold text-sm mb-1">${r.name}</h4>
            <p class="text-zinc-500 leading-normal mb-1.5">${r.address}</p>
            ${r.phone ? `<div class="flex items-center gap-1 font-semibold text-zinc-700">📞 <span>${r.phone}</span></div>` : ''}
            ${r.beds ? `<div class="mt-1 font-bold text-red-655">Beds: ${r.beds}</div>` : ''}
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
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col font-sans grid-bg">
      <Navigation />
      <div className="pt-28 pb-16 flex-grow flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 gap-8">
        
        {/* Sidebar / Resource List */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          <div className="bg-card border border-border rounded-xl p-5 shadow-2xl space-y-4">
            <div>
              <h1 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                <Compass className="w-5 h-5 text-accent animate-pulse" />
                Resource Proximity Map
              </h1>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Locate critical care beds, blood banks, and subsidized pharmacies. Sync your GPS coordinates to calculate routing distances automatically.
              </p>
            </div>

            {/* GPS Trigger Button */}
            <button
              onClick={handleGPSAcquisition}
              disabled={tracking}
              className="w-full py-2.5 rounded-lg bg-muted hover:bg-muted/85 text-muted-foreground hover:text-foreground font-bold text-xs flex items-center justify-center gap-2 border border-border transition-all cursor-pointer shadow-sm"
            >
              {tracking ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Acquiring Coordinates...
                </>
              ) : (
                <>
                  <Crosshair className="w-3.5 h-3.5" />
                  {userLat ? "GPS Coordinates Synced" : "Share GPS Location"}
                </>
              )}
            </button>

            {/* Search inputs */}
            <div className="flex items-center space-x-2 bg-muted border border-border rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-foreground placeholder-muted-foreground outline-none text-xs w-full"
              />
            </div>

            {/* Filter selector */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
              {[
                { id: "all", label: "All Items" },
                { id: "hospital", label: "Hospitals" },
                { id: "blood", label: "Blood Banks" },
                { id: "pharmacy", label: "Pharmacies" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id as any)}
                  className={`py-1.5 rounded-md border transition-all cursor-pointer ${
                    filterType === tab.id
                      ? "bg-foreground border-foreground text-background shadow"
                      : "bg-muted border-border text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nearest item details card */}
          {nearestResource && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-2xl space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-accent/20 text-accent text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-bl border-l border-b border-accent/30 animate-pulse">
                Nearest Match
              </div>
              <div className="text-[10px] text-accent font-bold uppercase tracking-wider flex items-center gap-1">
                <Navigation2 className="w-3 h-3 rotate-45" />
                Distance: {nearestResource.distance?.toFixed(2)} km away
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground leading-tight">{nearestResource.name}</h3>
                <p className="text-[11px] text-muted-foreground leading-normal mt-1">{nearestResource.address}</p>
              </div>
              <div className="flex gap-2 pt-2 text-[10px]">
                <button
                  onClick={() => focusResource(nearestResource)}
                  className="px-2.5 py-1.5 bg-muted hover:bg-muted/80 border border-border text-muted-foreground hover:text-foreground rounded font-semibold transition-colors cursor-pointer"
                >
                  Locate
                </button>
                {nearestResource.phone && (
                  <a
                    href={`tel:${nearestResource.phone}`}
                    className="px-2.5 py-1.5 bg-muted hover:bg-muted/80 border border-border text-muted-foreground hover:text-foreground rounded font-semibold transition-colors flex items-center gap-1"
                  >
                    📞 Call
                  </a>
                )}
              </div>
            </div>
          )}

          {/* List display */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-2xl flex-grow overflow-hidden flex flex-col max-h-[350px] lg:max-h-none">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Matches</h3>
            
            <div className="flex-grow overflow-y-auto space-y-2.5 pr-1 text-xs">
              {resources.length === 0 ? (
                <p className="text-muted-foreground text-center py-6 font-medium">Loading database resources...</p>
              ) : (
                resources
                  .filter(r => filterType === "all" || r.type === filterType)
                  .filter(r => searchQuery === "" || r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.address.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((res) => (
                    <div
                      key={res.id}
                      onClick={() => focusResource(res)}
                      className="p-3 border border-border rounded-lg bg-card hover:bg-muted/50 hover:border-muted-foreground/30 transition-colors flex items-start gap-2.5 cursor-pointer group"
                    >
                      <MapPin className={`w-4 h-4 flex-shrink-0 mt-0.5 ${res.type === "hospital" ? "text-red-500" : res.type === "blood" ? "text-amber-500" : "text-emerald-500"}`} />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-foreground group-hover:text-accent transition-colors truncate">{res.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate mt-0.5">{res.address}</div>
                        {res.distance && (
                          <div className="text-[9px] text-muted-foreground mt-1 font-semibold">📍 {res.distance.toFixed(1)} km away</div>
                        )}
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground self-center opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Map Container View */}
        <div className="flex-grow min-h-[400px] lg:min-h-0 bg-card border border-border rounded-xl overflow-hidden shadow-2xl relative">
          <div ref={mapContainerRef} className="w-full h-full z-10 relative bg-card" />
          
          {!mapLoaded && (
            <div className="absolute inset-0 bg-card flex flex-col items-center justify-center text-xs text-muted-foreground gap-2 z-20">
              <RefreshCw className="w-6 h-6 animate-spin text-accent" />
              <span>Initializing Interactive Leaflet Engine...</span>
            </div>
          )}
        </div>

      </div>
      <Footer />
    </div>
  );
}
