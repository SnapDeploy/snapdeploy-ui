import { useState, useEffect, useMemo } from "react";
import { Clock, AlertTriangle, Timer, TimerOff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ExpirationCountdownProps {
  expiresAt: string | null | undefined;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

type UrgencyLevel = "safe" | "warning" | "critical" | "expired";

function getUrgencyLevel(remainingMs: number): UrgencyLevel {
  if (remainingMs <= 0) return "expired";
  if (remainingMs < 30 * 60 * 1000) return "critical"; // < 30 min
  if (remainingMs < 2 * 60 * 60 * 1000) return "warning"; // < 2 hours
  return "safe";
}

function formatTimeRemaining(remainingMs: number): string {
  if (remainingMs <= 0) return "Expired";

  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function formatExactTime(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const urgencyStyles: Record<UrgencyLevel, string> = {
  safe: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
  warning: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
  critical: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 animate-pulse",
  expired: "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
};

const urgencyIcons: Record<UrgencyLevel, typeof Clock> = {
  safe: Timer,
  warning: Clock,
  critical: AlertTriangle,
  expired: TimerOff,
};

export function ExpirationCountdown({
  expiresAt,
  className,
  showIcon = true,
  compact = false,
}: ExpirationCountdownProps) {
  const [now, setNow] = useState(Date.now());

  // Parse expiration date
  const expirationDate = useMemo(() => {
    if (!expiresAt) return null;
    const date = new Date(expiresAt);
    return isNaN(date.getTime()) ? null : date;
  }, [expiresAt]);

  // Calculate remaining time
  const remainingMs = useMemo(() => {
    if (!expirationDate) return -1;
    return expirationDate.getTime() - now;
  }, [expirationDate, now]);

  const urgency = useMemo(() => getUrgencyLevel(remainingMs), [remainingMs]);
  const timeString = useMemo(() => formatTimeRemaining(remainingMs), [remainingMs]);

  // Update countdown every second when critical, every 10s when warning, every 30s otherwise
  useEffect(() => {
    if (!expirationDate || remainingMs <= 0) return;

    const interval = urgency === "critical" ? 1000 : urgency === "warning" ? 10000 : 30000;

    const timer = setInterval(() => {
      setNow(Date.now());
    }, interval);

    return () => clearInterval(timer);
  }, [expirationDate, remainingMs, urgency]);

  // Don't render if no expiration
  if (!expirationDate) {
    return null;
  }

  const IconComponent = urgencyIcons[urgency];

  const content = (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium",
        urgencyStyles[urgency],
        className
      )}
    >
      {showIcon && <IconComponent className="h-3.5 w-3.5" />}
      <span>
        {compact ? timeString : urgency === "expired" ? "Expired" : `Expires in ${timeString}`}
      </span>
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">
            {urgency === "expired"
              ? `Expired on ${formatExactTime(expirationDate)}`
              : `Expires on ${formatExactTime(expirationDate)}`}
          </p>
          {urgency !== "expired" && (
            <p className="text-xs text-muted-foreground mt-1">
              {remainingMs < 60 * 60 * 1000
                ? "Less than 1 hour remaining!"
                : `About ${Math.ceil(remainingMs / (1000 * 60 * 60))} hours remaining`}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Standalone hook for countdown logic (useful for custom implementations)
export function useExpirationCountdown(expiresAt: string | null | undefined) {
  const [now, setNow] = useState(Date.now());

  const expirationDate = useMemo(() => {
    if (!expiresAt) return null;
    const date = new Date(expiresAt);
    return isNaN(date.getTime()) ? null : date;
  }, [expiresAt]);

  const remainingMs = useMemo(() => {
    if (!expirationDate) return -1;
    return expirationDate.getTime() - now;
  }, [expirationDate, now]);

  const urgency = useMemo(() => getUrgencyLevel(remainingMs), [remainingMs]);

  useEffect(() => {
    if (!expirationDate || remainingMs <= 0) return;

    const interval = urgency === "critical" ? 1000 : urgency === "warning" ? 10000 : 30000;

    const timer = setInterval(() => {
      setNow(Date.now());
    }, interval);

    return () => clearInterval(timer);
  }, [expirationDate, remainingMs, urgency]);

  return {
    expirationDate,
    remainingMs,
    urgency,
    timeString: formatTimeRemaining(remainingMs),
    isExpired: remainingMs <= 0,
  };
}

