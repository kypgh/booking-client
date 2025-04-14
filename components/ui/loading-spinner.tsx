import React from "react";
import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
};

export default function LoadingSpinner({
  size = "md",
  className,
  fullScreen = false,
}: LoadingSpinnerProps) {
  // Size mapping
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  const spinnerClasses = cn(
    "animate-spin rounded-full border-solid border-primary border-t-transparent",
    sizeClasses[size],
    className
  );

  // If fullScreen, render a centered spinner that takes up the full screen
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
        <div className={spinnerClasses} />
      </div>
    );
  }

  // Otherwise, just render the spinner
  return <div className={spinnerClasses} />;
}
