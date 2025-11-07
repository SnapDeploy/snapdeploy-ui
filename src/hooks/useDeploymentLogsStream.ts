import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';

interface UseDeploymentLogsStreamOptions {
  enabled?: boolean;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export const useDeploymentLogsStream = (
  deploymentId: string | undefined,
  options: UseDeploymentLogsStreamOptions = {}
) => {
  const { enabled = true, onError, onConnected, onDisconnected } = options;
  const { getToken } = useAuth();
  
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const isConnectingRef = useRef(false);
  const seenLogsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!deploymentId || !enabled) {
      // Clear logs when disabled or no deployment
      setLogs([]);
      seenLogsRef.current.clear();
      isConnectingRef.current = false;
      return;
    }

    // Prevent duplicate connections from React Strict Mode
    if (isConnectingRef.current || eventSourceRef.current) {
      console.log('[SSE DEBUG] Already connecting or connected, skipping');
      return;
    }

    // Clear existing logs when starting a new SSE connection
    setLogs([]);
    seenLogsRef.current.clear();

    const connectSSE = async () => {
      // Mark as connecting
      isConnectingRef.current = true;

      // Use the same base URL as apiClient (includes /api/v1)
      const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';
      
      // Get fresh token from Clerk
      const token = await getToken();
      
      // DEBUG logging
      console.log('[SSE DEBUG] Connecting to SSE stream...');
      console.log('[SSE DEBUG] Deployment ID:', deploymentId);
      console.log('[SSE DEBUG] Base URL:', baseUrl);
      console.log('[SSE DEBUG] Token found:', !!token);
      if (token) {
        console.log('[SSE DEBUG] Token (first 50 chars):', token.substring(0, 50) + '...');
      }
      
      // SSE endpoint doesn't require auth for now (it's open)
      const url = `${baseUrl}/deployments/${deploymentId}/logs/stream`;

      console.log('[SSE DEBUG] Full URL:', url);

      // Create EventSource connection
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('[SSE DEBUG] Connection opened successfully! ✅');
      setIsConnected(true);
      setError(null);
      onConnected?.();
    };

    eventSource.addEventListener('log', (event) => {
      console.log('[SSE DEBUG] Log received:', event.data);
      const logLine = event.data;
      
      // Prevent duplicate logs by tracking seen log lines
      // Use a combination of log line content and a hash to detect duplicates
      const logKey = logLine.trim();
      
      // Skip if we've already seen this exact log line
      if (seenLogsRef.current.has(logKey)) {
        console.log('[SSE DEBUG] Skipping duplicate log:', logKey.substring(0, 50));
        return;
      }
      
      // Mark as seen and add to logs
      seenLogsRef.current.add(logKey);
      setLogs((prev) => [...prev, logLine]);
    });

    eventSource.addEventListener('heartbeat', () => {
      console.log('[SSE DEBUG] Heartbeat received');
    });

    eventSource.onerror = (e) => {
      console.error('[SSE DEBUG] Connection error:', e);
      console.log('[SSE DEBUG] ReadyState:', eventSource.readyState);
      setIsConnected(false);
      const error = new Error('SSE connection error');
      setError(error);
      onError?.(error);
      onDisconnected?.();
      
      // Close and cleanup
      eventSource.close();
    };

      // Cleanup on unmount
      return () => {
        console.log('[SSE DEBUG] Cleaning up SSE connection');
        eventSource.close();
        eventSourceRef.current = null;
        isConnectingRef.current = false;
        setIsConnected(false);
        seenLogsRef.current.clear();
      };
    };

    connectSSE();

    // Cleanup function for the effect itself
    return () => {
      if (eventSourceRef.current) {
        console.log('[SSE DEBUG] Effect cleanup - closing connection');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      isConnectingRef.current = false;
    };
  }, [deploymentId, enabled, onError, onConnected, onDisconnected, getToken]);

  const clearLogs = () => {
    setLogs([]);
    seenLogsRef.current.clear();
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  };

  return {
    logs,
    logsText: logs.join('\n'),
    isConnected,
    error,
    clearLogs,
    disconnect,
  };
};

