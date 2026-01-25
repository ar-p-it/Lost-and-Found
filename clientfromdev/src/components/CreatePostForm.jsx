import { useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { BASE_URL } from "../utils/constants";

// Fix marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Geocode helper
async function geocodeAddress(address) {
  if (!address?.trim()) return null;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
    );
    const data = await response.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        display_name: data[0].display_name,
      };
    }
  } catch (err) {
    console.error("Geocoding failed:", err);
  }
  return null;
}

export default function CreatePostForm() {
  const [postType, setPostType] = useState("LOST"); // 'LOST' or 'FOUND'

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: [],
    newTag: "",
  });

  // LOST-specific
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");

  // FOUND-specific
  const [foundLocation, setFoundLocation] = useState(null);
  const [foundInput, setFoundInput] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // --- Tag handlers ---
  const handleAddTag = () => {
    if (
      formData.newTag.trim() &&
      !formData.tags.includes(formData.newTag.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, formData.newTag.trim()],
        newTag: "",
      }));
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // --- Geocoding ---
  const geocodeAndSet = async (input, setter) => {
    if (!input.trim()) return null;
    const result = await geocodeAddress(input);
    if (result) {
      setter(result);
      return result;
    }
    setMessage(`❌ Could not find location: ${input}`);
    return null;
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      setMessage("Title and description are required.");
      return;
    }

    let payload = {
      type: postType,
      title: formData.title,
      description: formData.description,
      tags: formData.tags,
    };

    if (postType === "LOST") {
      let start = startLocation;
      let end = endLocation;

      if (!start && startInput.trim()) {
        start = await geocodeAndSet(startInput, setStartLocation);
      }
      if (!end && endInput.trim()) {
        end = await geocodeAndSet(endInput, setEndLocation);
      }

      if (!start || !end) {
        setMessage("Please enter valid start and end locations.");
        return;
      }
      payload.start = { lat: start.lat, lng: start.lng };
      payload.end = { lat: end.lat, lng: end.lng };
    } else if (postType === "FOUND") {
      let found = foundLocation;
      if (!found && foundInput.trim()) {
        found = await geocodeAndSet(foundInput, setFoundLocation);
      }
      if (!found) {
        setMessage("Please enter where the item was found.");
        return;
      }
      payload.location = { lat: found.lat, lng: found.lng };
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(`${BASE_URL}/broadcast`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ Success! Notified ${data.hubsNotified} hubs.`);
      } else {
        setMessage(`❌ Error: ${data.error || "Broadcast failed"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Network error. Is backend running?");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Report a {postType === "LOST" ? "Lost" : "Found"} Item
      </h2>

      {message && (
        <div
          className={`p-3 mb-4 rounded ${message.includes("Success") ? "bg-green-900" : "bg-red-900"}`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Post Type Toggle */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setPostType("LOST")}
            className={`flex-1 py-2 rounded ${postType === "LOST" ? "bg-green-700" : "bg-gray-700"}`}
          >
            🔴 I Lost an Item
          </button>
          <button
            type="button"
            onClick={() => setPostType("FOUND")}
            className={`flex-1 py-2 rounded ${postType === "FOUND" ? "bg-blue-700" : "bg-gray-700"}`}
          >
            🟢 I Found an Item
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="block mb-2 font-medium">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
            placeholder={
              postType === "LOST"
                ? "e.g., Red Backpack with Black Stripes"
                : "e.g., Black Wallet with ID Cards"
            }
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 font-medium">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows="4"
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
            placeholder={
              postType === "LOST"
                ? "Describe where/when you lost it, distinguishing features..."
                : "Describe where you found it, distinguishing features..."
            }
            required
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block mb-2 font-medium">Tags</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.newTag}
              onChange={(e) =>
                setFormData({ ...formData, newTag: e.target.value })
              }
              className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 text-white"
              placeholder="e.g., wallet, black, leather"
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-purple-600 rounded"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-purple-700 rounded-full flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-xs hover:text-red-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* LOCATION INPUTS */}
        {postType === "LOST" ? (
          <>
            {/* Start */}
            <div>
              <label className="block mb-2 font-medium text-green-400">
                Start Location *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={startInput}
                  onChange={(e) => setStartInput(e.target.value)}
                  onBlur={() => geocodeAndSet(startInput, setStartLocation)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      geocodeAndSet(startInput, setStartLocation);
                    }
                  }}
                  className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 text-white"
                  placeholder="e.g., City Hall, New York"
                  required
                />
                <button
                  type="button"
                  onClick={() => geocodeAndSet(startInput, setStartLocation)}
                  className="px-4 py-2 bg-green-700 rounded"
                >
                  Search
                </button>
              </div>
              {startLocation && (
                <p className="mt-1 text-sm text-green-300">
                  📍 {startLocation.display_name}
                </p>
              )}
            </div>

            {/* End */}
            <div>
              <label className="block mb-2 font-medium text-red-400">
                End Location *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={endInput}
                  onChange={(e) => setEndInput(e.target.value)}
                  onBlur={() => geocodeAndSet(endInput, setEndLocation)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      geocodeAndSet(endInput, setEndLocation);
                    }
                  }}
                  className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 text-white"
                  placeholder="e.g., Brooklyn Bridge Entrance"
                  required
                />
                <button
                  type="button"
                  onClick={() => geocodeAndSet(endInput, setEndLocation)}
                  className="px-4 py-2 bg-red-700 rounded"
                >
                  Search
                </button>
              </div>
              {endLocation && (
                <p className="mt-1 text-sm text-red-300">
                  📍 {endLocation.display_name}
                </p>
              )}
            </div>
          </>
        ) : (
          /* FOUND */
          <div>
            <label className="block mb-2 font-medium text-blue-400">
              Where Was It Found? *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={foundInput}
                onChange={(e) => setFoundInput(e.target.value)}
                onBlur={() => geocodeAndSet(foundInput, setFoundLocation)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    geocodeAndSet(foundInput, setFoundLocation);
                  }
                }}
                className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 text-white"
                placeholder="e.g., Andheri Railway Station, Mumbai"
                required
              />
              <button
                type="button"
                onClick={() => geocodeAndSet(foundInput, setFoundLocation)}
                className="px-4 py-2 bg-blue-700 rounded"
              >
                Search
              </button>
            </div>
            {foundLocation && (
              <p className="mt-1 text-sm text-blue-300">
                📍 {foundLocation.display_name}
              </p>
            )}
          </div>
        )}

        {/* MAP PREVIEW */}
        <div>
          <h3 className="font-medium mb-2">Location Preview</h3>
          <div className="h-64 rounded overflow-hidden border border-gray-600">
            <MapContainer
              key={`${startLocation?.lat || ""}-${endLocation?.lat || ""}-${foundLocation?.lat || ""}`}
              center={
                startLocation
                  ? [startLocation.lat, startLocation.lng]
                  : foundLocation
                    ? [foundLocation.lat, foundLocation.lng]
                    : [40.7128, -74.006]
              }
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {postType === "LOST" && startLocation && (
                <Marker position={[startLocation.lat, startLocation.lng]} />
              )}
              {postType === "LOST" && endLocation && (
                <Marker position={[endLocation.lat, endLocation.lng]} />
              )}
              {postType === "FOUND" && foundLocation && (
                <Marker position={[foundLocation.lat, foundLocation.lng]} />
              )}
              {postType === "LOST" && startLocation && endLocation && (
                <Polyline
                  positions={[
                    [startLocation.lat, startLocation.lng],
                    [endLocation.lat, endLocation.lng],
                  ]}
                  color="#3b82f6"
                  weight={4}
                />
              )}
            </MapContainer>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded font-semibold ${
            isSubmitting ? "bg-gray-600" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isSubmitting
            ? "Broadcasting..."
            : `Report ${postType === "LOST" ? "Lost" : "Found"} Item`}
        </button>
      </form>
    </div>
  );
}
