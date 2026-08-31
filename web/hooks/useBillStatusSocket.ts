import { useState, useEffect, useRef } from "react";
import { ProcessingStatus } from "@/types";
import { api } from "@/lib/api";

export function useBillStatusSocket(billId: string, initialStatus?: ProcessingStatus) {
  const [status, setStatus] = useState<ProcessingStatus>(initialStatus || "QUEUED");
  const [isConnected, setIsConnected] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const statusRef = useRef<ProcessingStatus>(status);
  const reconnectCountRef = useRef(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (!billId) return;

    if (status === "COMPLETED" || status === "FAILED") {
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("cv_access_token") : null;

    let wsUrlBase = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrlBase && typeof window !== "undefined") {
      const isHttps = window.location.protocol === "https:";
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
      if (apiBase.startsWith("https://")) {
        wsUrlBase = apiBase.replace("https://", "wss://");
      } else if (apiBase.startsWith("http://")) {
        wsUrlBase = apiBase.replace("http://", "ws://");
      } else if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        wsUrlBase = "ws://localhost:8000";
      } else {
        wsUrlBase = "wss://curaveris.onrender.com";
      }
    }

    const startPolling = () => {
      setIsPolling(true);
      setIsConnected(true);
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const res = await api.bills.getStatus(billId);
          if (res.processing_status) {
            const newStatus = res.processing_status as ProcessingStatus;
            setStatus(newStatus);
            setIsConnected(true);
            if (newStatus === "COMPLETED" || newStatus === "FAILED") {
              if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            }
          }
        } catch {
          // Graceful polling fallback
        }
      }, 5000);
    };

    const connectWebSocket = () => {
      if (!token || !wsUrlBase) {
        startPolling();
        return;
      }

      try {
        const fullWsUrl = `${wsUrlBase}/api/v1/bills/ws/${billId}/status?token=${token}`;
        const ws = new WebSocket(fullWsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          setIsPolling(false);
          reconnectCountRef.current = 0;
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.status) {
              setStatus(data.status as ProcessingStatus);
              setIsConnected(true);
            }
          } catch {
            // Ignored
          }
        };

        ws.onerror = () => {
          startPolling();
        };

        ws.onclose = () => {
          const currentStatus = statusRef.current;
          if (currentStatus !== "COMPLETED" && currentStatus !== "FAILED" && reconnectCountRef.current < 5) {
            reconnectCountRef.current += 1;
            setTimeout(connectWebSocket, 3000);
          } else if (currentStatus !== "COMPLETED" && currentStatus !== "FAILED") {
            startPolling();
          }
        };
      } catch {
        startPolling();
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [billId, status]);

  return { status, isConnected, isPolling };
}
