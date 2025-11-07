import { useEffect, useRef } from "react";
import { LazyLog } from "react-lazylog";
import { useDeployment } from "@/hooks/useDeployments";
import { useDeploymentLogsStream } from "@/hooks/useDeploymentLogsStream";
import { Button } from "@/components/ui/button";
import { Download, Wifi, WifiOff } from "lucide-react";
import { isDeploymentInProgress } from "@/hooks/useDeployments";

interface DeploymentLogsViewerProps {
  deploymentId: string;
  className?: string;
}

export function DeploymentLogsViewer({
  deploymentId,
  className = "",
}: DeploymentLogsViewerProps) {
  const { data: deployment } = useDeployment(deploymentId, {
    autoRefresh: false,
  });
  const useRealTime = true;
  const previousInProgressRef = useRef<boolean | undefined>(undefined);
  const previousLogsLengthRef = useRef<number>(0);

  // Use SSE for real-time logs if deployment is in progress
  const inProgress = deployment?.status
    ? isDeploymentInProgress(deployment.status)
    : false;

  const { logsText: realtimeLogs, isConnected } = useDeploymentLogsStream(
    deploymentId,
    { enabled: useRealTime && inProgress }
  );

  // Determine which logs to display - ONLY ONE SOURCE AT A TIME
  const displayLogs = (() => {
    // If deployment is NOT in progress, always use database logs
    if (!inProgress) {
      return deployment?.logs || "";
    }
    
    // Deployment IS in progress
    if (!useRealTime) {
      // Real-time disabled - use database logs
      return deployment?.logs || "";
    }
    
    // Real-time enabled and deployment in progress
    if (isConnected && realtimeLogs) {
      // SSE is connected and streaming - use ONLY SSE logs
      return realtimeLogs;
    }
    
    // SSE not connected yet or no logs - show database logs as fallback
    return deployment?.logs || "";
  })();

  // Scroll to bottom when deployment finalizes and logs are loaded
  useEffect(() => {
    const wasInProgress = previousInProgressRef.current;
    const isNowFinalized = wasInProgress === true && inProgress === false;
    const logsJustLoaded = !wasInProgress && !inProgress && displayLogs && displayLogs.length > previousLogsLengthRef.current;

    // If deployment just finalized OR logs were just loaded from database, scroll to bottom
    if ((isNowFinalized || logsJustLoaded) && displayLogs) {
      // Use multiple attempts with increasing delays to ensure LazyLog has rendered
      const scrollAttempts = [100, 300, 500];
      
      scrollAttempts.forEach((delay) => {
        setTimeout(() => {
          try {
            // Find the scrollable container - LazyLog creates elements with specific classes
            const logContainers = document.querySelectorAll('.react-lazylog');
            if (logContainers.length > 0) {
              // Find the scrollable element - LazyLog uses a div with overflow
              for (let i = logContainers.length - 1; i >= 0; i--) {
                const container = logContainers[i] as HTMLElement;
                // Try to find scrollable element by checking for overflow style or scrollHeight
                const scrollable = Array.from(container.querySelectorAll('*')).find(
                  (el) => {
                    const htmlEl = el as HTMLElement;
                    return htmlEl.scrollHeight > htmlEl.clientHeight && 
                           (htmlEl.style.overflow === 'auto' || 
                            htmlEl.style.overflow === 'scroll' ||
                            htmlEl.style.overflowY === 'auto' ||
                            htmlEl.style.overflowY === 'scroll');
                  }
                ) as HTMLElement || container;
                
                if (scrollable && scrollable.scrollHeight > scrollable.clientHeight) {
                  scrollable.scrollTop = scrollable.scrollHeight;
                  return; // Successfully scrolled
                }
              }
            }
          } catch (error) {
            console.warn('Failed to scroll logs:', error);
          }
        }, delay);
      });
    }

    previousInProgressRef.current = inProgress;
    previousLogsLengthRef.current = displayLogs.length;
  }, [inProgress, displayLogs]);

  const handleDownloadLogs = () => {
    const blob = new Blob([displayLogs], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deployment-${deploymentId}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 border-b">
        <div className="flex items-center gap-2">
          {inProgress && (
            <div className="flex items-center gap-2 text-sm">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">
                    Live
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Connecting...</span>
                </>
              )}
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadLogs}
          disabled={!displayLogs}
        >
          <Download className="h-4 w-4 mr-2" />
          Download Logs
        </Button>
      </div>

      {/* Log Viewer */}
      <div className="flex-1 overflow-hidden">
        {displayLogs ? (
          <LazyLog
            text={displayLogs}
            enableSearch
            follow={inProgress}
            selectableLines
            extraLines={1}
            height="600"
            caseInsensitive
            lineClassName="font-mono text-sm"
          />
        ) : (
          <div className="p-4 text-gray-500">No logs yet...</div>
        )}
      </div>
    </div>
  );
}
