"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";
import "tailwindcss/tailwind.css";

const currentYear = new Date().getFullYear();

const MAPBOX_ACCESS_TOKEN = "pk.eyJ1Ijoibm9haGIyMCIsImEiOiJjbTcybWoyazIwYnd6MnNwdzYyd3VjMG9qIn0.f_TJQWjWjJualT0xPfAjEA";
const FLASK_API_URL = "https://backend-model-server.onrender.com/predict";

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const Mapbox = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [locationData, setLocationData] = useState({
    lat: undefined,
    lng: undefined,
    altitude: undefined,
    temperature: undefined,
    humidity: undefined,
    prediction: undefined,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/noahb20/cm7337ns8008q01qu8p0s0jll",
      center: [0, 0],
      zoom: 2,
    });

    map.current.on("click", async (event) => {
      setLoading(true);
      const { lng, lat } = event.lngLat;
      const data = await fetchWeatherAndElevation(lat, lng);
      if (data) await fetchPrediction(data);
      setLoading(false);
    });
  }, []);

  const fetchWeatherAndElevation = async (lat: number, lng: number) => {
    try {
      const altitude = await getElevation(lat, lng);
      const weatherResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,relative_humidity_2m&timezone=auto`
      );

      const hourlyData = weatherResponse.data.hourly;
      const temperature = hourlyData.temperature_2m[0];
      const humidity = hourlyData.relative_humidity_2m[0];

      const data = { lat, lng, altitude, temperature, humidity };
      setLocationData(data);
      return data;
    } catch (error) {
      console.error("Error fetching weather and elevation:", error);
    }
  };

  const getElevation = async (lat: number, lng: number) => {
    try {
      const response = await axios.get(
        `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`
      );
      return response.data.results[0].elevation || 0;
    } catch (error) {
      console.error("Error fetching elevation:", error);
      return 0;
    }
  };

  const fetchPrediction = async (data) => {
    try {
      const response = await axios.post(FLASK_API_URL, {
        altitude: data.altitude,
        average_temperature: data.temperature,
        average_humidity: data.humidity,
      });
      setLocationData((prev) => ({ ...(prev || {}), prediction: response.data.prediction }));
    } catch (error) {
      console.error("Error fetching prediction:", error);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center h-screen bg-black text-white p-4 gap-4">
      <div className="w-full lg:w-1/3 bg-gray-800 p-6 rounded-lg shadow-lg text-center flex flex-col items-center gap-4">
        {loading ? (
          <div className="animate-spin w-6 h-6 border-4 border-gray-300 border-t-blue-500 rounded-full"></div>
        ) : locationData.lat !== undefined ? (
          <>
            <div className="bg-gray-700 p-4 rounded-lg w-full">
              <p>Altitude: {locationData.altitude?.toFixed(2)} m</p>
              <p>Temperature: {locationData.temperature}°C</p>
              <p>Humidity: {locationData.humidity}%</p>
              <p>Latitude: {locationData.lat}</p>
              <p>Longitude: {locationData.lng}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg w-full text-xl font-bold">
              Predicted TTM PUE {new Date().toLocaleDateString()}
            </div>
            {locationData.prediction !== undefined && (
              <div className="bg-gray-700 p-4 rounded-lg w-full text-6xl font-bold">
                {locationData.prediction.toFixed(2)}
              </div>
            )}
          </>
        ) : (
          <p>🌍 Select a location on the map</p>
        )}
      </div>
      <div ref={mapContainer} className="w-full lg:w-2/3 h-96 lg:h-[70vh] rounded-lg shadow-lg" />
      <footer className="w-full text-center p-2 bg-gray-800 fixed bottom-0 left-0">
        <p>&copy; {currentYear} NEB Synergy. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Mapbox;


// "use client";

// import { useEffect, useRef, useState } from "react";
// import mapboxgl from "mapbox-gl";
// import axios from "axios";

// const currentYear = new Date().getFullYear();

// const MAPBOX_ACCESS_TOKEN = "pk.eyJ1Ijoibm9haGIyMCIsImEiOiJjbTcybWoyazIwYnd6MnNwdzYyd3VjMG9qIn0.f_TJQWjWjJualT0xPfAjEA";
// // const FLASK_API_URL = "http://127.0.0.1:5000/predict"; // Replace with your Flask API URL if deployed
// const FLASK_API_URL ="https://backend-model-server.onrender.com/predict"


// //style: "mapbox://styles/mapbox/satellite-streets-v11",

// mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

// const Mapbox = () => {
//   const mapContainer = useRef<HTMLDivElement>(null);
//   const map = useRef<mapboxgl.Map | null>(null);
//   const [locationData, setLocationData] = useState<{
//     lat?: number;
//     lng?: number;
//     altitude?: number;
//     temperature?: number;
//     humidity?: number;
//     prediction?: number;
//   }>({});
//   const [loading, setLoading] = useState<boolean>(false);

//   useEffect(() => {
//     if (map.current || !mapContainer.current) return;

//     map.current = new mapboxgl.Map({
//       container: mapContainer.current,
//       style: "mapbox://styles/noahb20/cm7337ns8008q01qu8p0s0jll",
//       center: [0, 0],
//       zoom: 2,
//     });

//     map.current.on("click", async (event) => {
//       setLoading(true);
//       const { lng, lat } = event.lngLat;
//       const data = await fetchWeatherAndElevation(lat, lng);
//       if (data) await fetchPrediction(data);
//       setLoading(false);
//     });
//   }, []);

//   const fetchWeatherAndElevation = async (lat: number, lng: number) => {
//     try {
//       const altitude = await getElevation(lat, lng);
//       const weatherResponse = await axios.get(
//         `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,relative_humidity_2m&timezone=auto`
//       );

//       const hourlyData = weatherResponse.data.hourly;
//       const temperature = hourlyData.temperature_2m[0];
//       const humidity = hourlyData.relative_humidity_2m[0];

//       const data = { lat, lng, altitude, temperature, humidity };
//       setLocationData(data);
//       return data;
//     } catch (error) {
//       console.error("Error fetching weather and elevation:", error);
//     }
//   };

//   const getElevation = async (lat: number, lng: number): Promise<number> => {
//     try {
//       const response = await axios.get(
//         `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`
//       );
//       return response.data.results[0].elevation || 0;
//     } catch (error) {
//       console.error("Error fetching elevation:", error);
//       return 0;
//     }
//   };

//   const fetchPrediction = async (data: {
//     altitude: number;
//     temperature: number;
//     humidity: number;
//   }) => {
//     try {
//       const response = await axios.post(FLASK_API_URL, {
//         altitude: data.altitude,
//         average_temperature: data.temperature,
//         average_humidity: data.humidity,
//       });

//       const prediction = response.data.prediction;
//       //setLocationData((prev) => prev ? { ...prev, prediction } : null);
//       setLocationData((prev) => ({ ...(prev || {}), prediction }));
//     } catch (error) {
//       console.error("Error fetching prediction:", error);
//     }
//   };

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "row",
//         alignItems: "center",
//         justifyContent: "center",
//         height: "100vh",
//         backgroundColor: "#000",
//         color: "#fff",
//       }}
//     >
//       <div
//         style={{
//           width: "25vw",
//           height: "70vh",
//           background: "rgba(50, 50, 50, 0.85)",
//           padding: "20px",
//           borderRadius: "16px",
//           boxShadow: "0px 4px 15px rgba(255, 255, 255, 0.15)",
//           color: "#fff",
//           textAlign: "center",
//           fontFamily: "'SF Pro Display', Arial, sans-serif",
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "center",
//           gap: "10px",
//           marginRight: 25,
//           marginLeft: 10,
//         }}
//       >
//         {loading ? (
//           <div className="flex items-center justify-center">
//             <div className="w-6 h-6 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
//           </div>
//         ) : locationData.lat !== undefined && locationData.lng !== undefined ? (
//           <>
//             <div style={{backgroundColor: 'gray', borderRadius: 20, padding: 10}}>
//             <p>Altitude: {locationData.altitude?.toFixed(2)} m</p>
//             <p>Temperature: {locationData.temperature}°C</p>
//             <p>Humidity: {locationData.humidity}%</p>
//             <p>Latitude: {locationData.lat}</p>
//             <p>Longitude: {locationData.lng}</p>
//             </div>
//             <div style={{backgroundColor:'gray', borderRadius: 20, marginTop:10, marginBottom:10}}>
//             <p style={{ fontWeight: 'bold', fontSize: 30, padding: 10 }}>
//               Predicted TTM PUE {new Date().toLocaleDateString()}
//             </p>
//             </div>
//             <div style={{backgroundColor: 'gray', borderRadius: 20}}>
//             {locationData.prediction !== undefined && (
//               <p style={{fontSize: 150}}>{locationData.prediction.toFixed(2)}</p>
//             )}
//             </div>
//           </>
//         ) : (
//           <p>🌍 Select a location on the map</p>
//         )}
//       </div>
//       <div
//         ref={mapContainer}
//         style={{
//           width: "75vw",
//           height: "70vh",
//           borderRadius: "16px",
//           overflow: "hidden",
//           boxShadow: "0px 4px 10px rgba(255, 255, 255, 0.2)",
//           marginRight: 10,
//         }}
//       />
//       {/* Copyright Footer */}
//       <footer
//         style={{
//           width: "100%",
//           textAlign: "center",
//           padding: "10px 0",
//           backgroundColor: "rgba(50, 50, 50, 0.85)",
//           position: "absolute",
//           bottom: 0,
//           left: 0,
//           color: "#fff",
//         }}
//       >
//         <p>&copy; {currentYear} NEB Synergy. All Rights Reserved.</p>
//       </footer>
//     </div>
//   );
// };

// export default Mapbox;
