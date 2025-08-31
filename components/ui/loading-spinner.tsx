import React from "react";
import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  fullScreen?: boolean;
  message?: string;
  variant?: "spinner" | "dots" | "pulse";
};

export default function LoadingSpinner({
  size = "md",
  className,
  fullScreen = false,
  message,
  variant = "spinner",
}: LoadingSpinnerProps) {
  // Size mapping
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const borderSizes = {
    sm: "border-2",
    md: "border-3",
    lg: "border-4",
    xl: "border-4",
  };

  const SpinnerComponent = () => {
    if (variant === "dots") {
      return (
        <div className={cn("flex space-x-1", className)}>
          <div className={cn("rounded-full bg-primary animate-bounce", sizeClasses[size])} style={{ animationDelay: '0ms' }} />
          <div className={cn("rounded-full bg-primary animate-bounce", sizeClasses[size])} style={{ animationDelay: '150ms' }} />
          <div className={cn("rounded-full bg-primary animate-bounce", sizeClasses[size])} style={{ animationDelay: '300ms' }} />
        </div>
      );
    }

    if (variant === "pulse") {
      return (
        <div className={cn(
          "rounded-full bg-primary animate-pulse",
          sizeClasses[size],
          className
        )} />
      );
    }

    // Default spinner
    return (
      <div className={cn(
        "animate-spin rounded-full border-solid border-primary border-t-transparent",
        sizeClasses[size],
        borderSizes[size],
        className
      )} />
    );
  };

  const content = (
    <div className="flex flex-col items-center gap-3">
      <SpinnerComponent />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  // If fullScreen, render a centered spinner that takes up the full screen
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  // Otherwise, just render the spinner
  return content;
}
