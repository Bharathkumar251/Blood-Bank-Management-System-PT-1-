import React, { useEffect, useState, useRef } from "react";
import Layout from "../components/shared/Layout/Layout";
import API from "../services/API";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "react-toastify";

// Helper: Haversine distance in KM
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

// Custom SVG Icons
const createIcon = (color, label) => {
  return L.divIcon({
    className: "custom-map-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 34px;
        height: 34px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 3px 8px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-size: 14px;
          font-weight: bold;
        ">${label}</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });
};

const bloodBankIcon = createIcon("#b01826", "🩸");
const hospitalIcon = createIcon("#0d6efd", "🏥");
const userIcon = createIcon("#198754", "📍");

const NearbyLocator = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [facilities, setFacilities] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch facilities from backend
  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/locator/facilities");
      if (data?.success) {
        setFacilities(data.facilities);
      }
    } catch (error) {
      console.error("Failed to load facilities:", error);
      toast.error("Failed to load blood banks and hospitals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const initialLat = 13.0827; // Default Chennai coordinates
    const initialLng = 80.2707;

    const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers on facilities / filter change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Filtered list
    const filtered = facilities.filter((f) => {
      const matchesType =
        filterType === "all" ||
        (filterType === "organisation" && f.role === "organisation") ||
        (filterType === "hospital" && f.role === "hospital");

      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.phone.includes(searchQuery);

      return matchesType && matchesSearch;
    });

    // Add user marker if available
    if (userLocation) {
      const uMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
      })
        .addTo(map)
        .bindPopup(`<b>📍 Your Current Location</b><br><small>Finding blood centers near you</small>`);
      markersRef.current.push(uMarker);
    }

    // Add Facility Markers
    filtered.forEach((fac) => {
      const isOrg = fac.role === "organisation";
      const icon = isOrg ? bloodBankIcon : hospitalIcon;
      const distance = userLocation
        ? calculateDistance(userLocation.lat, userLocation.lng, fac.lat, fac.lng)
        : null;

      const popupHtml = `
        <div style="font-family: inherit; min-width: 200px; padding: 4px;">
          <span style="
            display: inline-block;
            font-size: 11px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 12px;
            background-color: ${isOrg ? "#fde8e9" : "#e7f1ff"};
            color: ${isOrg ? "#b01826" : "#0d6efd"};
            margin-bottom: 6px;
          ">
            ${isOrg ? "🩸 Blood Bank" : "🏥 Hospital"}
          </span>
          <h4 style="margin: 4px 0; font-size: 15px; font-weight: 700;">${fac.name}</h4>
          <p style="margin: 4px 0; font-size: 12px; color: #555;">📍 ${fac.address}</p>
          <p style="margin: 4px 0; font-size: 13px;">📞 <a href="tel:${fac.phone}" style="font-weight: 600; color: #0d6efd;">${fac.phone}</a></p>
          ${distance ? `<p style="margin: 4px 0; font-size: 12px; color: #198754; font-weight: bold;">🚗 ${distance} km away</p>` : ""}
          <div style="margin-top: 8px;">
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lng}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="
                display: inline-block;
                background-color: #b01826;
                color: white;
                font-size: 11px;
                font-weight: bold;
                padding: 5px 10px;
                border-radius: 4px;
                text-decoration: none;
              "
            >
              Get Directions ↗
            </a>
          </div>
        </div>
      `;

      const marker = L.marker([fac.lat, fac.lng], { icon })
        .addTo(map)
        .bindPopup(popupHtml);

      fac._marker = marker;
      markersRef.current.push(marker);
    });
  }, [facilities, filterType, searchQuery, userLocation]);

  // Geolocation: Find My Location
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported by your browser");
    }

    toast.info("Detecting your location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([coords.lat, coords.lng], 14, {
            duration: 1.5,
          });
        }
        toast.success("Location found! Showing nearest centers.");
      },
      (err) => {
        console.warn("Geolocation denied/failed:", err.message);
        toast.warning("Could not access GPS location. Showing default city center.");
      }
    );
  };

  // Fly to facility
  const handleFacilityClick = (fac) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([fac.lat, fac.lng], 15, { duration: 1.2 });
    if (fac._marker) {
      fac._marker.openPopup();
    }
  };

  // Filtered facility list for sidebar
  const displayedFacilities = facilities.filter((f) => {
    const matchesType =
      filterType === "all" ||
      (filterType === "organisation" && f.role === "organisation") ||
      (filterType === "hospital" && f.role === "hospital");

    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.phone.includes(searchQuery);

    return matchesType && matchesSearch;
  });

  return (
    <Layout>
      <div className="container-fluid p-3" style={{ height: "calc(100vh - 70px)", overflow: "hidden" }}>
        <div className="row h-100 g-3">
          {/* Left Panel: Search, Filters & Center List */}
          <div className="col-md-4 col-lg-4 d-flex flex-column h-100">
            <div className="card shadow-sm border-0 p-3 mb-2" style={{ borderRadius: "10px" }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="fw-bold mb-0" style={{ color: "#b01826" }}>
                  📍 Nearby Center Locator
                </h5>
                <button
                  className="btn btn-sm btn-outline-success fw-bold d-flex align-items-center gap-1"
                  onClick={handleLocateMe}
                >
                  <span>🎯</span> Locate Me
                </button>
              </div>

              {/* Search input */}
              <input
                type="text"
                className="form-control form-control-sm mb-2"
                placeholder="Search by center name, city, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Filter Buttons */}
              <div className="btn-group btn-group-sm w-100" role="group">
                <button
                  className={`btn ${filterType === "all" ? "btn-dark" : "btn-outline-dark"}`}
                  onClick={() => setFilterType("all")}
                >
                  All ({facilities.length})
                </button>
                <button
                  className={`btn ${filterType === "organisation" ? "btn-danger" : "btn-outline-danger"}`}
                  onClick={() => setFilterType("organisation")}
                >
                  🩸 Blood Banks
                </button>
                <button
                  className={`btn ${filterType === "hospital" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setFilterType("hospital")}
                >
                  🏥 Hospitals
                </button>
              </div>
            </div>

            {/* List of facilities */}
            <div
              className="card shadow-sm border-0 flex-grow-1 p-2"
              style={{ overflowY: "auto", borderRadius: "10px" }}
            >
              <div className="small text-muted mb-2 px-1">
                Showing <strong>{displayedFacilities.length}</strong> facilities nearby:
              </div>

              {loading ? (
                <div className="text-center py-4 text-muted">
                  <div className="spinner-border spinner-border-sm text-danger me-2" role="status"></div>
                  Loading locations...
                </div>
              ) : displayedFacilities.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No centers match your current filter.
                </div>
              ) : (
                displayedFacilities.map((fac) => {
                  const isOrg = fac.role === "organisation";
                  const distance = userLocation
                    ? calculateDistance(userLocation.lat, userLocation.lng, fac.lat, fac.lng)
                    : null;

                  return (
                    <div
                      key={fac._id}
                      className="card p-2 mb-2 border-0 shadow-sm"
                      style={{
                        cursor: "pointer",
                        borderLeft: `4px solid ${isOrg ? "#b01826" : "#0d6efd"}`,
                        borderRadius: "6px",
                        backgroundColor: "#fdfdfd",
                        transition: "transform 0.15s ease",
                      }}
                      onClick={() => handleFacilityClick(fac)}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(4px)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0px)")}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <span
                          className="badge"
                          style={{
                            backgroundColor: isOrg ? "#fde8e9" : "#e7f1ff",
                            color: isOrg ? "#b01826" : "#0d6efd",
                            fontSize: "11px",
                          }}
                        >
                          {isOrg ? "🩸 Blood Bank" : "🏥 Hospital"}
                        </span>
                        {distance && (
                          <span className="badge bg-success" style={{ fontSize: "10px" }}>
                            {distance} km
                          </span>
                        )}
                      </div>
                      <h6 className="fw-bold mt-1 mb-1" style={{ fontSize: "14px" }}>
                        {fac.name}
                      </h6>
                      <p className="text-muted small mb-1" style={{ fontSize: "12px", lineHeight: "1.3" }}>
                        📍 {fac.address}
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <a
                          href={`tel:${fac.phone}`}
                          className="small text-decoration-none fw-semibold"
                          style={{ color: "#0d6efd" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          📞 {fac.phone}
                        </a>
                        <span className="small text-muted" style={{ fontSize: "11px" }}>
                          Click to view map ➔
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Interactive Leaflet Map */}
          <div className="col-md-8 col-lg-8 h-100">
            <div
              className="card shadow-sm border-0 h-100 overflow-hidden"
              style={{ borderRadius: "10px" }}
            >
              <div
                ref={mapContainerRef}
                style={{ width: "100%", height: "100%", minHeight: "450px" }}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NearbyLocator;
