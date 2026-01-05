import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';

interface RuntimeLogsResponse {
  logs: string[];
  has_more: boolean;
  timestamp: string;
}

interface UseRuntimeLogsOptions {
  /** Whether to enable auto-refresh polling */
  autoRefresh?: boolean;
  /** Polling interval in milliseconds (default: 5000) */
  refreshInterval?: number;
  /** Number of log lines to fetch (default: 200) */
  lines?: number;
  /** Whether the hook is enabled */
  enabled?: boolean;
}

interface UseRuntimeLogsResult {
  logs: string[];
  logsText: string;
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  clear: () => void;
}

export function useRuntimeLogs(
  projectId: string | undefined,
  options: UseRuntimeLogsOptions = {}
): UseRuntimeLogsResult {
  const {
    autoRefresh = false,
    refreshInterval = 5000,
    lines = 200,
    enabled = true,
  } = options;

  const { getToken, isSignedIn } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchLogs = useCallback(async (isRefreshCall = false) => {
    if (!projectId || !isSignedIn) {
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      if (isRefreshCall) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const token = await getToken();
      const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';
      const url = `${baseUrl}/projects/${projectId}/runtime-logs?lines=${lines}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch runtime logs: ${response.status}`);
      }

      const data: RuntimeLogsResponse = await response.json();
      setLogs(data.logs || []);
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.error('[RuntimeLogs] Error fetching logs:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch runtime logs'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [projectId, isSignedIn, getToken, lines]);

  // Initial fetch
  useEffect(() => {
    if (enabled && projectId && isSignedIn) {
      fetchLogs(false);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [projectId, enabled, isSignedIn, fetchLogs]);

  // Auto-refresh polling
  useEffect(() => {
    if (autoRefresh && enabled && projectId && isSignedIn) {
      intervalRef.current = setInterval(() => {
        fetchLogs(true);
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [autoRefresh, enabled, projectId, isSignedIn, refreshInterval, fetchLogs]);

  const refetch = useCallback(async () => {
    await fetchLogs(false);
  }, [fetchLogs]);

  const clear = useCallback(() => {
    setLogs([]);
    setError(null);
  }, []);

  return {
    logs,
    logsText: logs.join('\n'),
    isLoading,
    isRefreshing,
    error,
    refetch,
    clear,
  };
}

