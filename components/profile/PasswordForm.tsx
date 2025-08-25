import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useUpdatePassword } from "@/hooks/useMutations";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/ui/loading-spinner";

type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

interface PasswordFormProps {
  onCancel?: () => void;
}

const PasswordForm: React.FC<PasswordFormProps> = ({ onCancel }) => {
  const { mutate: updatePassword, isPending: isUpdating } = useUpdatePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PasswordFormValues>();

  // Watch the newPassword field to compare with confirmPassword
  const newPassword = watch("newPassword");

  const onSubmit = (data: PasswordFormValues) => {
    updatePassword(data, {
      onSuccess: () => {
        toast.success("Password updated successfully");
        reset(); // Reset the form
        onCancel?.(); // Close the form
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update password");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            {...register("currentPassword", {
              required: "Current password is required",
            })}
          />
          {errors.currentPassword && (
            <p className="text-destructive text-xs">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            {...register("newPassword", {
              required: "New password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters long",
              },
            })}
          />
          {errors.newPassword && (
            <p className="text-destructive text-xs">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === newPassword || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <p className="text-destructive text-xs">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Password requirements:</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li>At least 6 characters long</li>
          <li>Both passwords must match</li>
        </ul>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isUpdating}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Updating...
            </>
          ) : (
            "Update Password"
          )}
        </Button>
      </div>
    </form>
  );
};

export default PasswordForm;
