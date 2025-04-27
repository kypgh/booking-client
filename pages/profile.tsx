import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useApi";
import { useUpdateProfile, useUpdatePassword } from "@/hooks/useMutations";
import { toast } from "react-hot-toast";

// Components
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "@/components/profile/ProfileForm";
import PasswordForm from "@/components/profile/PasswordForm";
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

export default function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading, logout, user } = useAuth();
  const router = useRouter();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

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

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <MainLayout title="Profile | FitBook" loading={true}>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  return (
    <MainLayout title="My Profile | FitBook" headerTitle="My Profile">
      <div className="space-y-6">
        {error ? (
          <div className="text-center py-10">
            <p className="text-destructive">Failed to load profile data</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.reload()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Profile Header with Logout */}
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">My Profile</h1>
              <Button
                variant="outline"
                onClick={() => setIsLogoutDialogOpen(true)}
              >
                Logout
              </Button>
            </div>

            {/* Profile Tabs */}
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="profile">Profile Information</TabsTrigger>
                <TabsTrigger value="password">Change Password</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProfileForm profileData={profileData} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="password">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PasswordForm />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
