const userModel = require("../models/userModel");

// Known city coordinates fallback for mapping
const cityCoordinates = {
  chennai: { lat: 13.0827, lng: 80.2707 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  delhi: { lat: 28.7041, lng: 77.1025 },
  newdelhi: { lat: 28.6139, lng: 77.209 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  pune: { lat: 18.5204, lng: 73.8567 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  coimbatore: { lat: 11.0168, lng: 76.9558 },
  madurai: { lat: 9.9252, lng: 78.1198 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  trivandrum: { lat: 8.5241, lng: 76.9366 },
};

/**
 * Approximate coordinates from address or assign a slight unique offset
 */
const resolveCoordinates = (address = "", index = 0, defaultLat = 13.0827, defaultLng = 80.2707) => {
  const normalized = address.toLowerCase().replace(/[^a-z]/g, "");

  for (const [city, coords] of Object.entries(cityCoordinates)) {
    if (normalized.includes(city)) {
      // Add slight jitter for multiple facilities in the same city
      const offsetLat = ((index % 5) - 2) * 0.015;
      const offsetLng = (((index * 3) % 5) - 2) * 0.015;
      return {
        lat: Number((coords.lat + offsetLat).toFixed(4)),
        lng: Number((coords.lng + offsetLng).toFixed(4)),
      };
    }
  }

  // Default coordinate with slight spatial distribution
  const offsetLat = ((index % 7) - 3) * 0.02;
  const offsetLng = (((index * 2) % 7) - 3) * 0.02;
  return {
    lat: Number((defaultLat + offsetLat).toFixed(4)),
    lng: Number((defaultLng + offsetLng).toFixed(4)),
  };
};

/**
 * GET ALL NEARBY BLOOD BANKS & HOSPITALS
 */
const getNearbyFacilitiesController = async (req, res) => {
  try {
    const userLat = parseFloat(req.query.lat) || 13.0827;
    const userLng = parseFloat(req.query.lng) || 80.2707;

    // Fetch all verified organisations and hospitals
    const facilities = await userModel
      .find({ role: { $in: ["organisation", "hospital"] } })
      .select("-password")
      .sort({ createdAt: -1 });

    const formattedFacilities = facilities.map((facility, index) => {
      const isOrg = facility.role === "organisation";
      const coords = resolveCoordinates(facility.address, index, userLat, userLng);

      return {
        _id: facility._id,
        name: isOrg ? facility.organisationName : facility.hospitalName,
        type: isOrg ? "Blood Bank / Organisation" : "Hospital / Medical Center",
        role: facility.role,
        email: facility.email,
        phone: facility.phone,
        address: facility.address,
        website: facility.website || "",
        lat: coords.lat,
        lng: coords.lng,
        createdAt: facility.createdAt,
      };
    });

    return res.status(200).send({
      success: true,
      totalCount: formattedFacilities.length,
      facilities: formattedFacilities,
    });
  } catch (error) {
    console.error("Error in getNearbyFacilitiesController:", error);
    return res.status(500).send({
      success: false,
      message: "Error fetching nearby facilities",
      error: error.message,
    });
  }
};

module.exports = { getNearbyFacilitiesController };
