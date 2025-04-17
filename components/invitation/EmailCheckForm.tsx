import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCheckInvitations } from "@/hooks/useMutations";

type EmailCheckFormProps = {
  onFoundInvitations: (invitations: any[]) => void;
};

type EmailFormData = {
  email: string;
};

const EmailCheckForm: React.FC<EmailCheckFormProps> = ({
  onFoundInvitations,
}) => {
  const { mutate: checkInvitations, isPending } = useCheckInvitations();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>();

  const onSubmit = (data: EmailFormData) => {
    checkInvitations(data.email, {
      onSuccess: (invitations: any) => {
        if (invitations && invitations.length > 0) {
          onFoundInvitations(invitations);
        } else {
          toast.error("No pending invitations found for this email");
        }
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to check invitations");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          autoComplete="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
        />
        {errors.email && (
          <p className="text-destructive text-xs mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Checking..." : "Check Invitations"}
      </Button>
    </form>
  );
};

export default EmailCheckForm;
