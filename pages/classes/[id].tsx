// pages/classes/[id].tsx
import React from "react";
import { useRouter } from "next/router";
import { Calendar, Clock, Users, AlertCircle } from "lucide-react";
import BrandLayout from "@/components/layouts/BrandLayout";
import { useClassDetails, useClassSessions } from "@/hooks/useApi";
import { useBrand } from "@/contexts/BrandContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isAfter } from "date-fns";

const today = new Date();
const inTwoWeeks = new Date();
const now = new Date();
inTwoWeeks.setDate(today.getDate() + 14);

export default function ClassDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { activeBrandId } = useBrand();

  // Get class details with the id from the URL
  const { data: classData, isLoading, error } = useClassDetails(id as string);

  // Get upcoming sessions for this class

  const { data: sessions, isLoading: sessionsLoading } = useClassSessions(
    id as string,
    {
      startDate: today.toISOString(),
      endDate: inTwoWeeks.toISOString(),
      includeFullyBooked: true,
    }
  );

  // Format schedule days into a readable string
  const formatScheduleDays = (days: string[]) => {
    if (!days || days.length === 0) return "No schedule available";

    // If it's everyday (7 days), return "Everyday"
    if (days.length === 7) return "Everyday";

    // If it's weekdays only (Mon-Fri)
    if (
      days.length === 5 &&
      days.includes("Monday") &&
      days.includes("Tuesday") &&
      days.includes("Wednesday") &&
      days.includes("Thursday") &&
      days.includes("Friday") &&
      !days.includes("Saturday") &&
      !days.includes("Sunday")
    ) {
      return "Weekdays";
    }

    // Otherwise, format as comma-separated list
    return days.join(", ");
  };

  // Format time in 12-hour format
  const formatTime = (time: string) => {
    if (!time) return "";

    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);

    if (isNaN(hour)) return time;

    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;

    return `${hour12}:${minutes} ${period}`;
  };

  const handleGoBack = () => {
    router.push(`/classes`);
  };

  return (
    <BrandLayout
      title={classData ? `${classData.name} | FitBook` : "Class Details"}
      loading={isLoading}
      showBackButton={true}
      headerTitle={classData?.name || "Class Details"}
    >
      {error ? (
        <div className="text-center py-10">
          <p className="text-destructive">Failed to load class details</p>
          <Button variant="outline" className="mt-4" onClick={handleGoBack}>
            Go Back
          </Button>
        </div>
      ) : classData ? (
        <div className="space-y-6">
          {/* Class Info Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold">{classData.name}</h1>
              </div>

              <div className="flex flex-wrap gap-4 mb-4 text-sm">
                <div className="flex items-center">
                  <Clock size={16} className="mr-1 text-muted-foreground" />
                  <span>{classData.duration} minutes</span>
                </div>
                <div className="flex items-center">
                  <Users size={16} className="mr-1 text-muted-foreground" />
                  <span>Capacity: {classData.capacity}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-muted-foreground text-sm">
                  {classData.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Card for Fixed Classes */}
          {classData.businessType === "fixed" && classData.schedule && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Calendar size={16} className="mr-2" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  <div>
                    <span className="text-muted-foreground text-sm">
                      Days:{" "}
                    </span>
                    <span className="font-medium">
                      {formatScheduleDays(classData.schedule.days)}
                    </span>
                  </div>
                  {classData.schedule.startTime &&
                    classData.schedule.endTime && (
                      <div>
                        <span className="text-muted-foreground text-sm">
                          Time:{" "}
                        </span>
                        <span className="font-medium">
                          {formatTime(classData.schedule.startTime)} -{" "}
                          {formatTime(classData.schedule.endTime)}
                        </span>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Operating Hours Card for Hourly Classes */}
          {classData.businessType === "hourly" && classData.operatingHours && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Clock size={16} className="mr-2" />
                  Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {classData.operatingHours.days &&
                    classData.operatingHours.days.length > 0 && (
                      <div>
                        <span className="text-muted-foreground text-sm">
                          Days:{" "}
                        </span>
                        <span className="font-medium">
                          {formatScheduleDays(classData.operatingHours.days)}
                        </span>
                      </div>
                    )}

                  {classData.operatingHours.timeBlocks &&
                    classData.operatingHours.timeBlocks.length > 0 && (
                      <div className="mt-3">
                        <span className="text-muted-foreground text-sm block mb-1">
                          Time Blocks:
                        </span>
                        <div className="space-y-2 pl-2">
                          {classData.operatingHours.timeBlocks.map(
                            (block, index) => (
                              <div
                                key={index}
                                className="border-l-2 border-primary/30 pl-2 py-1"
                              >
                                <div className="font-medium">
                                  {formatTime(block.startTime)} -{" "}
                                  {formatTime(block.endTime)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {block.interval} minute sessions • Max
                                  capacity: {block.capacity}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          )}



          {/* Upcoming Sessions */}
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-3">Upcoming Sessions</h2>

            {sessionsLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading upcoming sessions...
              </div>
            ) : sessions && sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((session: any) => {
                  const sessionDate = parseISO(session.dateTime);
                  const isAvailable = session.availableSpots > 0;
                  const isFuture = isAfter(sessionDate, now);

                  return (
                    <Card
                      key={session._id}
                      className={`${
                        !isFuture || !isAvailable ? "opacity-60" : ""
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">
                              {format(sessionDate, "EEEE, MMMM d")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(sessionDate, "h:mm a")} •{" "}
                              {session.duration} min
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={isAvailable ? "outline" : "secondary"}
                            >
                              {session.availableSpots} spots left
                            </Badge>
                            {isFuture && (
                              <Button
                                size="sm"
                                className="mt-2"
                                disabled={!isAvailable}
                                onClick={() =>
                                  router.push(`/book/${session._id}`)
                                }
                              >
                                {isAvailable ? "Book" : "Full"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No upcoming sessions available.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </BrandLayout>
  );
}
