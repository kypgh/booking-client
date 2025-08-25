// pages/classes.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import BrandLayout from "@/components/layouts/BrandLayout";
import { useClassList, ClassData } from "@/hooks/useApi";
import { useBrand } from "@/contexts/BrandContext";
import { Calendar, Clock, Users } from "lucide-react";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { APP_NAME } from "@/lib/envs";

export default function ClassesPage() {
  const router = useRouter();
  const { activeBrandId, activeBrand } = useBrand();

  // Use the activeBrandId directly from the brand context
  const { data: classes, isLoading, error } = useClassList();

  const handleViewClass = (classId: string) => {
    // Route to the session details page with the active brand ID
    router.push(`/classes/${classId}`);
  };

  return (
    <BrandLayout headerTitle="Available Classes">
      {/* Error state */}
      {error && (
        <div className="text-center py-10 text-destructive">
          <p>Error loading classes. Please try again.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.reload()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Empty state */}
      {classes?.length === 0 && !isLoading && (
        <div className="text-center py-10 text-muted-foreground">
          <p>No classes available for this brand.</p>
        </div>
      )}

      {/* Classes list */}
      <div className="space-y-4">
        {classes?.map((classItem: ClassData) => (
          <ClassCard
            key={classItem._id}
            classData={classItem}
            onClick={() => handleViewClass(classItem._id)}
          />
        ))}
      </div>
    </BrandLayout>
  );
}

// Class card component
interface ClassCardProps {
  classData: ClassData;
  onClick: () => void;
}

const ClassCard: React.FC<ClassCardProps> = ({ classData, onClick }) => {
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

  return (
    <Card
      className="cursor-pointer overflow-hidden hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="font-medium">{classData.name}</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {classData.description || "No description available."}
        </p>

        {/* Schedule information - Fixed Class Type */}
        {classData.businessType === "fixed" && classData.schedule && (
          <div className="mb-3 p-2 bg-accent/30 rounded-md">
            <div className="flex items-center text-sm mb-1">
              <Calendar size={14} className="mr-1 text-primary" />
              <span className="font-medium">Schedule:</span>
            </div>
            <div className="text-sm pl-5">
              <div>{formatScheduleDays(classData.schedule.days)}</div>
              {classData.schedule.startTime && classData.schedule.endTime && (
                <div>
                  {formatTime(classData.schedule.startTime)} -{" "}
                  {formatTime(classData.schedule.endTime)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Operating Hours - Hourly Type */}
        {classData.businessType === "hourly" && classData.operatingHours && (
          <div className="mb-3 p-2 bg-accent/30 rounded-md">
            <div className="flex items-center text-sm mb-1">
              <Clock size={14} className="mr-1 text-primary" />
              <span className="font-medium">Operating Hours:</span>
            </div>
            <div className="text-sm pl-5">
              {classData.operatingHours.days &&
                classData.operatingHours.days.length > 0 && (
                  <div>{formatScheduleDays(classData.operatingHours.days)}</div>
                )}
              {classData.operatingHours.timeBlocks &&
                classData.operatingHours.timeBlocks.length > 0 && (
                  <div className="space-y-1 mt-1">
                    {classData.operatingHours.timeBlocks.map((block, index) => (
                      <div key={index}>
                        {formatTime(block.startTime)} -{" "}
                        {formatTime(block.endTime)}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({block.interval} min sessions)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center mr-4">
            <Clock size={14} className="mr-1" />
            <span>{classData.duration} min</span>
          </div>

          <div className="flex items-center mr-4">
            <Users size={14} className="mr-1" />
            <span>Max {classData.capacity}</span>
          </div>
        </div>


      </CardContent>
    </Card>
  );
};
