import React, { useState, useEffect } from "react";
import useMapSetup from "../../utils/useMapSetup";
import useGeolocation from "../../utils/useGeolocation";
import LocationDisplay from "../LocationComponent/LocationDisplay";
import "./MapComponent.css";

const MapComponent = () => {
  const { userLocation, error } = useGeolocation();
  const [mapCenter, setMapCenter] = useState([78.9629, 20.5937]);
  const mapViewRef = useMapSetup(mapCenter);

  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
    }
  }, [userLocation]);

  return (
    <div className="map-container">
      <LocationDisplay userLocation={userLocation} error={error} />
      <div ref={mapViewRef} className="map-view"></div>
    </div>
  );
};

export default MapComponent;
