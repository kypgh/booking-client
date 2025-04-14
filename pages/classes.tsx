import React, { useState } from "react";
import { useRouter } from "next/router";
import MainLayout from "@/components/layouts/MainLayout";
import { useClassList, ClassData } from "@/hooks/useApi";
import { Calendar, Clock, Users, Search, Filter } from "lucide-react";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function ClassesPage() {
  const router = useRouter();
  const [businessType, setBusinessType] = useState<
    "fixed" | "hourly" | undefined
  >(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: classes, isLoading, error } = useClassList(businessType);

  // Filter classes based on search query
  const filteredClasses = classes?.filter(
    (cls: any) =>
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewClass = (classId: string) => {
    router.push(`/classes/${classId}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <MainLayout
      title="Classes | FitBook"
      headerTitle="Browse Classes"
      loading={isLoading}
    >
      {/* Search Bar */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search classes..."
            className="pl-9"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs for class type */}
      <Tabs
        defaultValue="all"
        onValueChange={(value) => {
          if (value === "all") setBusinessType(undefined);
          else if (value === "fixed") setBusinessType("fixed");
          else setBusinessType("hourly");
        }}
        className="mb-6"
      >
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">
            All
          </TabsTrigger>
          <TabsTrigger value="fixed" className="flex-1">
            Classes
          </TabsTrigger>
          <TabsTrigger value="hourly" className="flex-1">
            Open Gym
          </TabsTrigger>
        </TabsList>
      </Tabs>

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
      {filteredClasses?.length === 0 && !isLoading && (
        <div className="text-center py-10 text-muted-foreground">
          <p>No classes found.</p>
          {searchQuery && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </Button>
          )}
        </div>
      )}

      {/* Classes list */}
      <div className="space-y-4">
        {filteredClasses?.map((classItem: any) => (
          <ClassCard
            key={classItem._id}
            classData={classItem}
            onClick={() => handleViewClass(classItem._id)}
          />
        ))}
      </div>
    </MainLayout>
  );
}

// Class card component
interface ClassCardProps {
  classData: ClassData;
  onClick: () => void;
}

const ClassCard: React.FC<ClassCardProps> = ({ classData, onClick }) => {
  return (
    <Card
      className="cursor-pointer overflow-hidden hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Optional class image - uncomment if you have images */}
        {/* <div className="h-32 bg-muted-foreground/10">
          <img 
            src="/path-to-placeholder-image.jpg" 
            alt={classData.name}
            className="h-full w-full object-cover"
          />
        </div> */}

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">{classData.name}</h3>
            <Badge
              variant={
                classData.businessType === "fixed" ? "default" : "secondary"
              }
            >
              {classData.businessType === "fixed" ? "Class" : "Open Gym"}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {classData.description || "No description available."}
          </p>

          <div className="flex flex-wrap gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center mr-4">
              <Clock size={14} className="mr-1" />
              <span>{classData.duration} min</span>
            </div>

            <div className="flex items-center mr-4">
              <Users size={14} className="mr-1" />
              <span>Max {classData.capacity}</span>
            </div>

            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              <span>Multiple sessions</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
            <div className="text-sm">
              <span className="text-muted-foreground">Instructor: </span>
              <span>{classData.instructor?.name || "TBD"}</span>
            </div>
            <Button size="sm" variant="outline">
              Book
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
