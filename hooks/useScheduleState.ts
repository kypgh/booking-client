import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Define the shape of our schedule state
interface ScheduleState {
  currentDate: string; // ISO date string
  selectedDate: string | null; // ISO date string or null
  brandId: string | null;
}

// Default state
const defaultState: ScheduleState = {
  currentDate: new Date().toISOString(),
  selectedDate: new Date().toISOString(),
  brandId: null,
};

// Cache key for our state
const SCHEDULE_STATE_CACHE_KEY = "scheduleState";

export function useScheduleState(brandId: string | null) {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // Get the cached state from React Query cache
  const getCachedState = (): ScheduleState => {
    const cachedState = queryClient.getQueryData<ScheduleState>([
      SCHEDULE_STATE_CACHE_KEY,
    ]);

    // If we have cached state and the brandId matches, return it
    if (cachedState && cachedState.brandId === brandId) {
      return cachedState;
    }

    // Otherwise, return default state with the provided brandId
    return {
      ...defaultState,
      brandId: brandId,
    };
  };

  // Initialize state with cached values
  const [state, setState] = useState<ScheduleState>(defaultState);

  // Load the cached state when brandId changes or on mount
  useEffect(() => {
    if (brandId) {
      setState(getCachedState());
      setIsInitialized(true);
    }
  }, [brandId]);

  // Update the cache whenever state changes
  useEffect(() => {
    if (isInitialized && state.brandId) {
      queryClient.setQueryData([SCHEDULE_STATE_CACHE_KEY], state);
    }
  }, [state, queryClient, isInitialized]);

  // Setter functions for each piece of state
  const setCurrentDate = (date: Date) => {
    setState((prev) => ({
      ...prev,
      currentDate: date.toISOString(),
    }));
  };

  const setSelectedDate = (date: Date | null) => {
    setState((prev) => ({
      ...prev,
      selectedDate: date ? date.toISOString() : null,
    }));
  };

  // Return the state and setters
  return {
    currentDate: new Date(state.currentDate),
    selectedDate: state.selectedDate ? new Date(state.selectedDate) : null,
    setCurrentDate,
    setSelectedDate,
  };
}
