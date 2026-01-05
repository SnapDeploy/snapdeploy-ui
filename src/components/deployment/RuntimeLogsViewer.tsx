import { useEffect, useRef } from "react";
import { LazyLog } from "react-lazylog";
import { useRuntimeLogs } from "@/hooks/useRuntimeLogs";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, AlertCircle, Loader2, Server } from "lucide-react";

interface RuntimeLogsViewerProps {
  projectId: string;
  isDeployed: boolean;
  className?: string;
  autoRefresh?: boolean;
}

export function RuntimeLogsViewer({
  projectId,
  isDeployed,
  className = "",
  autoRefresh = true,
}: RuntimeLogsViewerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    logs,
    logsText,
    isLoading,
    isRefreshing,
    error,
    refetch,
  } = useRuntimeLogs(projectId, {
    enabled: isDeployed,
    autoRefresh: autoRefresh && isDeployed,
    refreshInterval: 5000,
    lines: 500,
  });

  // Scroll to bottom when new logs arrive
  useEffect(() => {
    if (logs.length > 0 && scrollContainerRef.current) {
      // Find LazyLog's scrollable container
      const logContainers = scrollContainerRef.current.querySelectorAll('.react-lazylog');
      if (logContainers.length > 0) {
        const container = logContainers[logContainers.length - 1] as HTMLElement;
        const scrollable = Array.from(container.querySelectorAll('*')).find(
          (el) => {
            const htmlEl = el as HTMLElement;
            return htmlEl.scrollHeight > htmlEl.clientHeight;
          }
        ) as HTMLElement || container;

        if (scrollable && scrollable.scrollHeight > scrollable.clientHeight) {
          scrollable.scrollTop = scrollable.scrollHeight;
        }
      }
    }
  }, [logs.length]);

  const handleDownloadLogs = () => {
    if (!logsText) return;
    
    const blob = new Blob([logsText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `runtime-logs-${projectId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Not deployed state
  if (!isDeployed) {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <Server className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No Running Service
            </h3>
            <p className="text-gray-500 text-sm max-w-md">
              Runtime logs will be available once your deployment is live. 
              Complete a successful deployment to see your application's output.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading && logs.length === 0) {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Loading runtime logs...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && logs.length === 0) {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Unable to Load Logs
            </h3>
            <p className="text-gray-500 text-sm max-w-md mb-4">
              {error.message || "Failed to fetch runtime logs. The service may still be starting up."}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`} ref={scrollContainerRef}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 border-b">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                <span className="text-blue-600 dark:text-blue-400">
                  Refreshing...
                </span>
              </>
            ) : autoRefresh ? (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-600 dark:text-green-400">
                  Auto-refresh on
                </span>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadLogs}
            disabled={!logsText}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Log Viewer */}
      <div className="flex-1 overflow-hidden">
        {logsText ? (
          <LazyLog
            text={logsText}
            enableSearch
            follow={autoRefresh}
            selectableLines
            extraLines={1}
            height="600"
            caseInsensitive
            lineClassName="font-mono text-sm"
          />
        ) : (
          <div className="p-4 text-gray-500 flex items-center justify-center h-full">
            <div className="text-center">
              <Server className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p>No runtime logs available yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Logs will appear here as your application produces output.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

