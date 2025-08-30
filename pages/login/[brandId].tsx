// pages/login/[brandId].tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useBrand } from "@/contexts/BrandContext";
import { getErrorMessage } from "@/lib/errorUtils";
import { getBrandInfo } from "@/hooks/useApi";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { APP_NAME } from "@/lib/envs";

// Login form type definition
type LoginFormData = {
  email: string;
  password: string;
};

export default function BrandLoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { setActiveBrandId } = useBrand();
  const router = useRouter();
  const { brandId } = router.query;
  const [isLoading, setIsLoading] = useState(false);

  // Fetch brand information
  const {
    data: brandData,
    isLoading: isBrandLoading,
    error: brandError,
  } = getBrandInfo(brandId as string);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  // Set active brand ID from URL
  useEffect(() => {
    if (brandId && typeof brandId === "string") {
      setActiveBrandId(brandId);
    }
  }, [brandId, setActiveBrandId]);

  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Form submission handler
  const onSubmit = async (data: LoginFormData) => {
    if (!brandId) {
      toast.error("Brand ID is missing");
      return;
    }

    setIsLoading(true);
    try {
      await login(data.email, data.password, brandId as string);
      setActiveBrandId(brandId as string);
      toast.success("Login successful!");
      router.push("/");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(getErrorMessage(error) || "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!brandId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold">Invalid Login URL</h2>
            <p className="mt-2 text-muted-foreground">
              No brand identifier found.
            </p>
            <Link href="/">
              <Button className="mt-4">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (brandError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold">Brand Not Found</h2>
            <p className="mt-2 text-muted-foreground">
              We couldn't find the specified brand. Please check the URL or
              contact support.
            </p>
            <Link href="/">
              <Button className="mt-4">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>
          {isBrandLoading ? "Login" : `Login to ${brandData?.name || APP_NAME}`}
        </title>
        <meta
          name="description"
          content={
            brandData?.description || `Login to your ${APP_NAME} account`
          }
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            {isBrandLoading ? (
              <div className="flex justify-center">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <>
                {brandData?.logo && (
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {brandData.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}
                <CardTitle className="text-2xl font-bold text-primary">
                  {brandData?.name || APP_NAME}
                </CardTitle>
                {brandData?.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {brandData.description}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  Enter your credentials to login
                </p>
              </>
            )}
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
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

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                {errors.password && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || isBrandLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            {!isBrandLoading && (
              <>
                <div className="text-sm text-center text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    href={`/register/${brandId}`}
                    className="text-primary hover:underline"
                  >
                    Register
                  </Link>
                </div>
                <div className="text-sm text-center">
                  <Link
                    href="/invitation"
                    className="text-muted-foreground hover:text-primary hover:underline"
                  >
                    Check Invitation
                  </Link>
                </div>
                {brandData?.contact && (
                  <div className="text-xs text-center text-muted-foreground mt-4 pt-4 border-t border-border w-full">
                    Need help? Contact us at{" "}
                    <a
                      href={`mailto:${brandData.contact.email || ""}`}
                      className="text-primary"
                    >
                      {brandData.contact.email}
                    </a>
                  </div>
                )}
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
