import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { ProfileData } from "@/api/profileApi";
import { useUpdateProfile } from "@/hooks/useMutations";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface ProfileFormProps {
  profileData?: ProfileData;
}

type ProfileFormValues = {
  name: string;
  dateOfBirth: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  medicalConditions: string;
  allergies: string;
  medications: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
};

const ProfileForm: React.FC<ProfileFormProps> = ({ profileData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  // Initialize form with existing data
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormValues>({
    defaultValues: {
      name: profileData?.name || "",
      dateOfBirth: profileData?.dateOfBirth
        ? new Date(profileData.dateOfBirth).toISOString().split("T")[0]
        : "",
      emergencyContactName: profileData?.emergencyContact?.name || "",
      emergencyContactPhone: profileData?.emergencyContact?.phone || "",
      emergencyContactRelationship:
        profileData?.emergencyContact?.relationship || "",
      medicalConditions:
        profileData?.healthInfo?.medicalConditions?.join(", ") || "",
      allergies: profileData?.healthInfo?.allergies?.join(", ") || "",
      medications: profileData?.healthInfo?.medications?.join(", ") || "",
      emailNotifications:
        profileData?.preferences?.notificationPreferences?.email || false,
      smsNotifications:
        profileData?.preferences?.notificationPreferences?.sms || false,
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    // Convert form data to API format
    const updatedProfile = {
      name: data.name,
      dateOfBirth: data.dateOfBirth || undefined,
      emergencyContact: {
        name: data.emergencyContactName,
        phone: data.emergencyContactPhone,
        relationship: data.emergencyContactRelationship,
      },
      healthInfo: {
        medicalConditions: data.medicalConditions
          ? data.medicalConditions
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        allergies: data.allergies
          ? data.allergies
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        medications: data.medications
          ? data.medications
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
      },
      preferences: {
        notificationPreferences: {
          email: data.emailNotifications,
          sms: data.smsNotifications,
        },
      },
    };

    updateProfile(updatedProfile, {
      onSuccess: () => {
        toast.success("Profile updated successfully");
        setIsEditing(false);
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update profile");
      },
    });
  };

  const handleCancel = () => {
    // Reset form values and exit edit mode
    reset();
    setIsEditing(false);
  };

  return (
    <div>
      {!isEditing ? (
        // View-only mode
        <div className="space-y-6">
          <div className="flex justify-between">
            <h3 className="text-lg font-medium">Personal Information</h3>
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          </div>

          <div className="grid gap-4">
            <div>
              <h4 className="font-medium">Name</h4>
              <p className="text-muted-foreground">
                {profileData?.name || "Not provided"}
              </p>
            </div>

            <div>
              <h4 className="font-medium">Email</h4>
              <p className="text-muted-foreground">
                {profileData?.email || "Not provided"}
              </p>
            </div>

            <div>
              <h4 className="font-medium">Date of Birth</h4>
              <p className="text-muted-foreground">
                {profileData?.dateOfBirth
                  ? new Date(profileData.dateOfBirth).toLocaleDateString()
                  : "Not provided"}
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Emergency Contact</h4>
              {profileData?.emergencyContact?.name ? (
                <div className="space-y-1">
                  <p>
                    <span className="text-muted-foreground">Name: </span>
                    {profileData.emergencyContact.name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Phone: </span>
                    {profileData.emergencyContact.phone || "Not provided"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      Relationship:{" "}
                    </span>
                    {profileData.emergencyContact.relationship ||
                      "Not provided"}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No emergency contact information
                </p>
              )}
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Health Information</h4>
              <div className="space-y-2">
                <div>
                  <p className="font-medium text-sm">Medical Conditions:</p>
                  <p className="text-muted-foreground">
                    {profileData?.healthInfo?.medicalConditions?.length
                      ? profileData.healthInfo.medicalConditions.join(", ")
                      : "None provided"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm">Allergies:</p>
                  <p className="text-muted-foreground">
                    {profileData?.healthInfo?.allergies?.length
                      ? profileData.healthInfo.allergies.join(", ")
                      : "None provided"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm">Medications:</p>
                  <p className="text-muted-foreground">
                    {profileData?.healthInfo?.medications?.length
                      ? profileData.healthInfo.medications.join(", ")
                      : "None provided"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Notification Preferences</h4>
              <div className="space-y-1">
                <p>
                  <span className="text-muted-foreground">
                    Email notifications:{" "}
                  </span>
                  {profileData?.preferences?.notificationPreferences?.email
                    ? "Enabled"
                    : "Disabled"}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    SMS notifications:{" "}
                  </span>
                  {profileData?.preferences?.notificationPreferences?.sms
                    ? "Enabled"
                    : "Disabled"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Edit mode
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-destructive text-xs">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Emergency Contact</h4>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    {...register("emergencyContactName")}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    {...register("emergencyContactPhone")}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="emergencyContactRelationship">
                    Relationship
                  </Label>
                  <Input
                    id="emergencyContactRelationship"
                    {...register("emergencyContactRelationship")}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Health Information</h4>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="medicalConditions">
                    Medical Conditions (comma separated)
                  </Label>
                  <Textarea
                    id="medicalConditions"
                    {...register("medicalConditions")}
                    placeholder="e.g. Asthma, Diabetes"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="allergies">Allergies (comma separated)</Label>
                  <Textarea
                    id="allergies"
                    {...register("allergies")}
                    placeholder="e.g. Peanuts, Penicillin"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="medications">
                    Medications (comma separated)
                  </Label>
                  <Textarea
                    id="medications"
                    {...register("medications")}
                    placeholder="e.g. Ibuprofen, Insulin"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Notification Preferences</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifications">
                    Email notifications
                  </Label>
                  <Switch
                    id="emailNotifications"
                    {...register("emailNotifications")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="smsNotifications">SMS notifications</Label>
                  <Switch
                    id="smsNotifications"
                    {...register("smsNotifications")}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileForm;
