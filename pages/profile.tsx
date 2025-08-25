import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useBrand } from "@/contexts/BrandContext";
import { useUserProfile } from "@/hooks/useApi";
import { useUpdateProfile, useUpdatePassword } from "@/hooks/useMutations";
import { toast } from "react-hot-toast";

// Components
import MainLayout from "@/components/layouts/MainLayout";
import BrandSwitcher from "@/components/BrandSwitcher";
import DarkModeToggle from "@/components/DarkModeToggle";
import ProfileForm from "@/components/profile/ProfileForm";
import PasswordForm from "@/components/profile/PasswordForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/ui/loading-spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Building,
  LogOut,
  Edit,
  Phone,
  Heart,
  Bell,
  UserCheck,
  Settings,
  Monitor
} from "lucide-react";

export default function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading, logout, user } = useAuth();
  const { activeBrand } = useBrand();
  const router = useRouter();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Safe date formatting function
  const formatDate = (date: string | null | undefined, formatStr = "MMM d, yyyy") => {
    if (!date) return null;
    
    try {
      const dateObj = new Date(date);
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return null;
      }
      
      return format(dateObj, formatStr);
    } catch (error) {
      console.error("Date formatting error:", error, "Date value:", date);
      return null;
    }
  };

  // Fetch user profile data
  const {
    data: profileData,
    isLoading: profileLoading,
    error,
  } = useUserProfile();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <MainLayout title="Profile | FitBook" headerTitle="Profile">
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Profile | FitBook" headerTitle="Profile">
        <div className="text-center py-20">
          <User className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load profile</h2>
          <p className="text-muted-foreground mb-6">Please try again or contact support</p>
          <Button onClick={() => router.reload()}>
            Retry
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Profile | FitBook" headerTitle="Profile">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileData?.avatar} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {getUserInitials(profileData?.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">{profileData?.name || "User"}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{profileData?.email}</span>
                  </div>
                  {profileData?.dateOfBirth && formatDate(profileData.dateOfBirth, "MMMM d, yyyy") && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Born {formatDate(profileData.dateOfBirth, "MMMM d, yyyy")}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsLogoutDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Brand Selection */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              <CardTitle>Active Brand</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                {activeBrand?.name ? (
                  <>
                    <p className="font-medium text-lg">{activeBrand.name}</p>
                    {activeBrand.description && (
                      <p className="text-sm text-muted-foreground">{activeBrand.description}</p>
                    )}
                    {activeBrand.contact?.website && (
                      <a 
                        href={activeBrand.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline block"
                      >
                        Visit Website
                      </a>
                    )}
                  </>
                ) : (
                  <p className="font-medium text-lg text-muted-foreground">Loading brand...</p>
                )}
              </div>
              <BrandSwitcher />
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                <CardTitle>Personal Information</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                {isEditingProfile ? "Cancel" : "Edit"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditingProfile ? (
              <ProfileForm 
                profileData={profileData} 
                onCancel={() => setIsEditingProfile(false)}
                onSave={() => setIsEditingProfile(false)}
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                    <p className="font-medium">{profileData?.name || "Not provided"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email Address</p>
                    <p className="font-medium">{profileData?.email || "Not provided"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date of Birth</p>
                    <p className="font-medium">
                      {formatDate(profileData?.dateOfBirth) || "Not provided"}
                    </p>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">Emergency Contact</p>
                    </div>
                    {profileData?.emergencyContact?.name ? (
                      <div className="space-y-1 pl-6">
                        <p className="font-medium">{profileData.emergencyContact.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {profileData.emergencyContact.phone || "No phone provided"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {profileData.emergencyContact.relationship || "Relationship not specified"}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground pl-6">Not provided</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Information */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <CardTitle>Health Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium mb-2">Medical Conditions</p>
                <p className="text-sm text-muted-foreground">
                  {profileData?.healthInfo?.medicalConditions?.length
                    ? profileData.healthInfo.medicalConditions.join(", ")
                    : "None reported"}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Allergies</p>
                <p className="text-sm text-muted-foreground">
                  {profileData?.healthInfo?.allergies?.length
                    ? profileData.healthInfo.allergies.join(", ")
                    : "None reported"}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Medications</p>
                <p className="text-sm text-muted-foreground">
                  {profileData?.healthInfo?.medications?.length
                    ? profileData.healthInfo.medications.join(", ")
                    : "None reported"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive booking confirmations and updates</p>
              </div>
              <Badge variant={profileData?.preferences?.notificationPreferences?.email ? "default" : "secondary"}>
                {profileData?.preferences?.notificationPreferences?.email ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">Receive text messages for important updates</p>
              </div>
              <Badge variant={profileData?.preferences?.notificationPreferences?.sms ? "default" : "secondary"}>
                {profileData?.preferences?.notificationPreferences?.sms ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              <CardTitle>Appearance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">Choose between light and dark mode</p>
              </div>
              <DarkModeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Security</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                {isChangingPassword ? "Cancel" : "Change Password"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isChangingPassword ? (
              <PasswordForm onCancel={() => setIsChangingPassword(false)} />
            ) : (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">Keep your account secure with a strong password</p>
                </div>
                <p className="text-sm text-muted-foreground">••••••••</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You will need to sign in again
              to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay logged in</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
