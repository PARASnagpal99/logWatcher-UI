import axios from "axios";
import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";

export const LogWatcher = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseUrl = "/api/v1/events/";

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(baseUrl);
        console.log("API Response:", response.data);
        setLogs(response.data.events || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
        setError("Failed to fetch logs. Please try again.");
        setLoading(false);
      }
    };

    fetchLogs();

    const socket = new Client({
      brokerURL: "ws://localhost:8080/ws",
      onConnect: () => {
        console.log("WebSocket connected");
        socket.subscribe("/topic/events", (message) => {
          const newLog = message.body;
          console.log("Got message:", newLog);
          setLogs((prevLogs) => [newLog, ...prevLogs].slice(0, 10)); 
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error: " + frame);
        setError("WebSocket connection error. Please try again.");
      },
      reconnectDelay: 5000,
    });

    socket.activate();

    return () => {
      socket.deactivate();
    };
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "90%",
          height: "90%",
          overflowY: "scroll",
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          border: "1px solid #ddd",
        }}
      >
        <div
          style={{
            marginBottom: "10px",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#4a4a4a",
            textAlign: "center",
          }}
        >
          Live Logs
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#888", padding: "20px" }}>
            <span>Loading logs...</span>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", color: "red", padding: "20px" }}>
            <span>{error}</span>
          </div>
        ) : logs.length > 0 ? (
          logs.map((log, index) => (
            <div
              key={index}
              style={{
                padding: "15px",
                margin: "10px 0",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                fontSize: "14px",
                color: "#333",
                lineHeight: "1.5",
              }}
            >
              {log}
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", color: "#888", padding: "20px" }}>
            <span>No logs available</span>
          </div>
        )}
      </div>
    </div>
  );
};
