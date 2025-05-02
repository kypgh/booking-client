import { useActiveBookings } from "./useApi";

export function useSessionBookingStatus() {
  const { data: activeBookings, isLoading } = useActiveBookings();

  const isSessionBooked = (sessionId: string): boolean => {
    if (!activeBookings || activeBookings.length === 0) return false;

    return activeBookings.some(
      (booking) =>
        booking.session._id === sessionId || booking.session.id === sessionId
    );
  };

  return {
    isSessionBooked,
    isLoading,
  };
}
