import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

// Components
import MainLayout from "@/components/layouts/MainLayout";
import RegistrationForm from "@/components/invitation/RegistrationForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, ArrowLeft } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useVerifyInvitation } from "@/hooks/useApi";

export default function InvitationAcceptPage() {
  const router = useRouter();
  const { token } = router.query;
  const tokenString = typeof token === "string" ? token : "";

  const {
    data: invitation,
    isLoading,
    error,
  } = useVerifyInvitation(tokenString, !!tokenString);

  // Show loading state
  if (isLoading) {
    return (
      <MainLayout
        title="Verifying Invitation | FitBook"
        showNavigation={false}
        loading={true}
      >
        <LoadingSpinner />
      </MainLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <MainLayout title="Invalid Invitation | FitBook" showNavigation={false}>
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 pb-4 px-6 text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h1 className="text-xl font-semibold mb-2">Invalid Invitation</h1>
              <p className="text-muted-foreground mb-6">
                This invitation link is invalid or has expired.
              </p>
              <Link href="/invitation">
                <Button className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Check Another Invitation
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Show registration form if invitation is valid
  if (invitation) {
    return (
      <MainLayout
        title={`Join ${invitation.brand.name} | FitBook`}
        showNavigation={false}
        showBackButton={true}
        headerTitle={`Join ${invitation.brand.name}`}
      >
        <Head>
          <title>Accept Invitation | FitBook</title>
          <meta
            name="description"
            content="Accept your invitation and join FitBook"
          />
        </Head>

        <div className="max-w-md mx-auto my-6">
          <div className="mb-6">
            <p className="text-muted-foreground">
              You've been invited to join {invitation.brand.name} on FitBook.
              Complete your registration below.
            </p>
          </div>

          <RegistrationForm invitation={invitation} token={tokenString} />
        </div>
      </MainLayout>
    );
  }

  // Default loading state while we wait for the router to be ready
  return (
    <MainLayout title="Loading Invitation | FitBook" showNavigation={false}>
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    </MainLayout>
  );
}
