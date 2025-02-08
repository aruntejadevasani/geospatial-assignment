import React from "react";

const LocationDisplay = ({ userLocation, error }) => {
  return (
    <div className="location-display">
      {error ? (
        <p>{error}</p>
      ) : (
        <p className="location">
          Current Location:{" "}
          {userLocation
            ? `${userLocation[1]}, ${userLocation[0]}`
            : "Fetching location..."}
        </p>
      )}
    </div>
  );
};

export default LocationDisplay;
