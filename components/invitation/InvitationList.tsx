import React from "react";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { InvitationData } from "@/api/invitationApi";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowLeft } from "lucide-react";

type InvitationListProps = {
  invitations: InvitationData[];
  onBack: () => void;
};

const InvitationList: React.FC<InvitationListProps> = ({
  invitations,
  onBack,
}) => {
  const router = useRouter();

  const handleAcceptInvitation = (token: string) => {
    router.push(`/invitation/${token}`);
  };

  // Format date for display
  const formatExpiryDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy");
    } catch (e) {
      return "Unknown";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="mr-2 p-1 rounded-full hover:bg-accent"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-semibold">Pending Invitations</h2>
      </div>

      {invitations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No pending invitations found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{invitation.brand.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Invitation expires: {formatExpiryDate(invitation.expires)}
                    </p>
                  </div>
                  <Badge variant="default">Pending</Badge>
                </div>

                {invitation.clientData?.name && (
                  <p className="text-sm mb-2">
                    <span className="text-muted-foreground">Name: </span>
                    {invitation.clientData.name}
                  </p>
                )}

                {invitation.clientData?.notes && (
                  <p className="text-sm mb-4 border-l-2 border-primary/30 pl-2 italic">
                    "{invitation.clientData.notes}"
                  </p>
                )}

                <Button
                  onClick={() =>
                    handleAcceptInvitation(
                      invitation.token || "token-placeholder"
                    )
                  }
                  className="w-full mt-2"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept Invitation
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvitationList;
