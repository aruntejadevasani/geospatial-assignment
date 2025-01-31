import React, { useEffect, useState } from "react";
import { MapView, WebMap, WebScene } from "@arcgis/react-arcgis";
import "@arcgis/core/assets/esri/themes/dark/main.css";
import { Search } from "@arcgis/core/widgets/Search";

const MapComponent2 = () => {
  const [userLocation, setUserLocation] = useState([78.9629, 20.5937]); // Default to India coordinates
  const [error, setError] = useState(null);

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            console.log(
              "Current Location:",
              latitude,
              longitude,
              "Accuracy:",
              accuracy
            );
            setUserLocation([longitude, latitude]); // Update with actual location
          },
          (err) => {
            setError(err.message);
            console.error("Geolocation error:", err);
            setUserLocation([78.9629, 20.5937]); // Fall back to default location (India)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } else {
        setError("Geolocation not supported by this browser.");
      }
    };

    getLocation();
  }, []);

  return (
    <div>
      <div>
        {error ? (
          <p>{error}</p>
        ) : (
          <p>
            Current Location: {userLocation[1]}, {userLocation[0]}
          </p>
        )}
      </div>

      <div style={{ height: "70vh", width: "70vw", top: 0, left: 0 }}>
        <MapView
          mapProperties={{ basemap: "topo-vector" }}
          viewProperties={{
            center: userLocation,
            zoom: 10,
          }}
          style={{ height: "100%", width: "100%" }}
        >
          {/* Adding search widget */}
          <Search
            viewProperties={{
              view: {
                center: userLocation,
              },
            }}
          />
        </MapView>
      </div>
    </div>
  );
};

export default MapComponent2;
