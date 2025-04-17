import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import { InvitationData } from "@/api/invitationApi";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAcceptInvitation } from "@/hooks/useMutations";

type RegistrationFormProps = {
  invitation: InvitationData;
  token: string;
};

type RegistrationFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  invitation,
  token,
}) => {
  const router = useRouter();
  const { mutate: acceptInvitation, isPending } = useAcceptInvitation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegistrationFormData>({
    defaultValues: {
      email: invitation.email,
      name: invitation.clientData?.name || "",
    },
  });

  const password = watch("password");

  const onSubmit = (data: RegistrationFormData) => {
    // Remove confirmPassword as it's not needed in the API call
    const { confirmPassword, ...userData } = data;

    acceptInvitation(
      { token, userData },
      {
        onSuccess: (data: any) => {
          toast.success(
            data.message || "Registration successful! Welcome to FitBook."
          );
          router.push("/");
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to complete registration");
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Complete Your Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-destructive text-xs mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              readOnly
              className="bg-muted/30"
              {...register("email")}
            />
            <p className="text-xs text-muted-foreground">
              Email is linked to your invitation and cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters long",
                },
              })}
            />
            {errors.password && (
              <p className="text-destructive text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <p className="text-destructive text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Processing..." : "Complete Registration"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegistrationForm;
