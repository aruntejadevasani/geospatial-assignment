import { useCallback, useEffect, useRef } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Search from "@arcgis/core/widgets/Search";
import Home from "@arcgis/core/widgets/Home";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import PopupTemplate from "@arcgis/core/PopupTemplate";

const useMapSetup = (mapCenter) => {
  const mapViewRef = useRef(null);

  const initializeMap = useCallback(async () => {
    const newMap = new Map({
      basemap: "dark-gray",
    });

    const view = new MapView({
      container: mapViewRef.current,
      map: newMap,
      center: mapCenter,
      zoom: 12,
    });

    await view.when();
    return view;
  }, [mapCenter]);

  const addWidgets = (view) => {
    const home = new Home({ view });
    view.ui.add(home, "top-left");

    const searchWidget = new Search({
      view: view,
    });
    view.ui.add(searchWidget, "top-right");
  };

  const addGeoJSONLayer = (map) => {
    const geoJsonUrl =
      "https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/LATEST_CORE_SITE_READINGS/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson";

    const geoJsonLayer = new GeoJSONLayer({
      url: geoJsonUrl,
      outFields: ["*"],
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

    map.add(geoJsonLayer);
    return geoJsonLayer;
  };

  const configurePopupTemplate = (layer) => {
    layer.popupTemplate = new PopupTemplate({
      title: "{SITE_NAME}",
      content: (feature) => {
        const attributes = feature.graphic.attributes;
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

  useEffect(() => {
    let view;

    const setupMap = async () => {
      try {
        view = await initializeMap();
        addWidgets(view);

        const geoJsonLayer = addGeoJSONLayer(view.map);

        configurePopupTemplate(geoJsonLayer);
      } catch (error) {
        console.error("Error setting up map:", error);
      }
    };

    setupMap();

    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, [initializeMap]);

  return mapViewRef;
};

export default useMapSetup;
