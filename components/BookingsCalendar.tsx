// components/BookingsCalendar.tsx
import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BookingsCalendarProps {
  bookings: any[];
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
  className?: string;
}

export default function BookingsCalendar({
  bookings,
  onDateSelect,
  selectedDate,
  className = "",
}: BookingsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const goToPrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    return bookings.filter((booking) =>
      isSameDay(parseISO(booking.session.dateTime), date)
    );
  };

  // Check if a date has bookings
  const hasBookings = (date: Date) => {
    return getBookingsForDate(date).length > 0;
  };

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={goToPrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <Button variant="outline" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date) => {
              const dayBookings = getBookingsForDate(date);
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isCurrentDay = isToday(date);
              const hasSessionsToday = hasBookings(date);

              return (
                <Button
                  key={date.toISOString()}
                  variant={isSelected ? "default" : "ghost"}
                  className={`h-12 p-1 flex flex-col items-center justify-center text-xs relative ${
                    !isCurrentMonth
                      ? "opacity-30"
                      : isCurrentDay
                      ? "bg-primary/10 border border-primary/20"
                      : ""
                  } ${hasSessionsToday ? "font-semibold" : ""}`}
                  onClick={() => onDateSelect(date)}
                  disabled={!isCurrentMonth}
                >
                  <span className="text-sm">{format(date, "d")}</span>
                  {hasSessionsToday && (
                    <div className="absolute bottom-1 flex gap-0.5">
                      {dayBookings.slice(0, 3).map((_, index) => (
                        <div
                          key={index}
                          className="w-1 h-1 rounded-full bg-primary"
                        />
                      ))}
                      {dayBookings.length > 3 && (
                        <span className="text-[8px] text-primary ml-0.5">
                          +{dayBookings.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Sessions */}
      {selectedDate && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-primary" />
              <h4 className="font-medium">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h4>
            </div>

            {getBookingsForDate(selectedDate).length > 0 ? (
              <div className="space-y-2">
                {getBookingsForDate(selectedDate).map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between p-2 bg-accent/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {booking.session.class?.name || "Class"}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(
                              parseISO(booking.session.dateTime),
                              "h:mm a"
                            )}{" "}
                            • {booking.session.duration} min
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        booking.status === "confirmed"
                          ? "default"
                          : booking.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No bookings for this date
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
