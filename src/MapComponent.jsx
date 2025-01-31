import React, { useEffect, useState, useRef } from "react";
import "@arcgis/core/assets/esri/themes/dark/main.css";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Search from "@arcgis/core/widgets/Search";
import Home from "@arcgis/core/widgets/Home";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import PopupTemplate from "@arcgis/core/PopupTemplate";

const MapComponent = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([78.9629, 20.5937]);
  const mapViewRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation([longitude, latitude]);
            setMapCenter([longitude, latitude]);
          },
          (err) => {
            setError(err.message);
            console.error("Geolocation error:", err);
            setMapCenter([78.9629, 20.5937]);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } else {
        setError("Geolocation not supported by this browser.");
        setMapCenter([78.9629, 20.5937]);
      }
    };
    getLocation();
  }, []);

  useEffect(() => {
    let view;
    const addMap = async () => {
      const response = await fetch(
        "https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/LATEST_CORE_SITE_READINGS/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson"
      );
      const data = await response.json();

      const newMap = await new Map({
        basemap: "dark-gray",
      });

      view = await new MapView({
        container: mapViewRef.current,
        map: newMap,
        center: mapCenter,
        zoom: 12,
      });

      await view.when();

      const home = new Home({ view });
      view.ui.add(home, "top-left");

      const searchWidget = new Search({
        view: view,
      });
      view.ui.add(searchWidget, "top-right");

      const geoJsonUrl =
        "https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/LATEST_CORE_SITE_READINGS/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson";

      const geoJsonLayer = new GeoJSONLayer({
        url: geoJsonUrl,
        renderer: {
          type: "simple",
          symbol: new SimpleMarkerSymbol({
            color: [0, 0, 255, 0.4],
            size: Math.floor(Math.random() * (20 - 8 + 1)) + 8,
            outline: {
              color: "black",
              width: 2,
            },
          }),
        },
      });

      newMap.add(geoJsonLayer);

      geoJsonLayer.popupTemplate = new PopupTemplate({
        title: "{SITE_NAME}",
        content: (feature) => {
          const attributes = feature.graphic.attributes;
          console.log(data);
          let obj = data?.features?.find((o) => o.id === attributes.OBJECTID);
          attributes["SITE_ADDRESS"] = obj.properties.SITE_ADDRESS;
          attributes["CARBON_MONOXIDE_PPM"] =
            obj.properties.CARBON_MONOXIDE_PPM;
          attributes["NITROGEN_DIOXIDE_PPM"] =
            obj.properties.NITROGEN_DIOXIDE_PPM;
          attributes["PM25_UG_M3"] = obj.properties.PM25_UG_M3;
          attributes["SAMPLE_HOUR"] = obj.properties.SAMPLE_HOUR;
          return `
            <b>Site Address:</b> ${attributes.SITE_ADDRESS || "N/A"}<br>
            <b>Carbon Monoxide (ppm):</b> ${
              attributes.CARBON_MONOXIDE_PPM || "N/A"
            }<br>
            <b>Nitrogen Dioxide (ppm):</b> ${
              attributes.NITROGEN_DIOXIDE_PPM || "N/A"
            }<br>
            <b>PM2.5 (µg/m³):</b> ${attributes.PM25_UG_M3 || "N/A"}<br>
            <b>Sample Hour:</b> ${attributes.SAMPLE_HOUR || "N/A"}<br>
          `;
        },
      });
    };

    addMap();

    const handleResize = () => {
      if (view && view.container) {
        view.container.style.width = "70vw";
        view.container.style.height = "70vh";
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      if (view) {
        view.destroy();
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [mapCenter]);

  return (
    <div>
      <div>
        {error ? (
          <p>{error}</p>
        ) : (
          <p>
            Current Location:
            {userLocation
              ? `${userLocation[1]}, ${userLocation[0]}`
              : "Not Available"}
          </p>
        )}
      </div>

      <div
        ref={mapViewRef}
        style={{
          height: "70vh",
          width: "70vw",
          top: 0,
          left: 0,
          backgroundColor: "black",
        }}
      ></div>
    </div>
  );
};

export default MapComponent;
