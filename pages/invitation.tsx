import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { InvitationData } from "@/api/invitationApi";

// Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmailCheckForm from "@/components/invitation/EmailCheckForm";
import InvitationList from "@/components/invitation/InvitationList";
import { ArrowLeft } from "lucide-react";

export default function InvitationPage() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<InvitationData[] | null>(null);

  const handleFoundInvitations = (foundInvitations: InvitationData[]) => {
    setInvitations(foundInvitations);
  };

  const handleBackToEmailCheck = () => {
    setInvitations(null);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <>
      <Head>
        <title>Check Invitations | FitBook</title>
        <meta
          name="description"
          content="Check and accept your FitBook invitations"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          {/* Back button */}
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
          </div>

          {invitations ? (
            <InvitationList
              invitations={invitations}
              onBack={handleBackToEmailCheck}
            />
          ) : (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-primary">
                  FitBook Invitations
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Enter your email to check for pending invitations
                </p>
              </CardHeader>
              <CardContent>
                <EmailCheckForm onFoundInvitations={handleFoundInvitations} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
