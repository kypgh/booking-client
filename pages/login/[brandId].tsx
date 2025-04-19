import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

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

// Login form type definition
type LoginFormData = {
  email: string;
  password: string;
};

export default function BrandLoginPage() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const { brandId } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [brandName, setBrandName] = useState("Loading...");
  const [isBrandLoading, setIsBrandLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Fetch brand information
  useEffect(() => {
    if (brandId && typeof brandId === "string") {
      // This is just a placeholder - in reality, you'd fetch the brand name from your API
      // For now, we'll simulate it with a timeout

      const mockFetchBrand = () => {
        // Mock brand data based on ID
        const brandData = {
          "67bb00a19f5bc27ae88e5a53": "FitBook Gym",
          "67bb04529f5bc27ae88e5a54": "Yoga Studio",
          "67bb04a19f5bc27ae88e5a55": "CrossFit Center",
        };

        setTimeout(() => {
          setBrandName(
            brandData[brandId as keyof typeof brandData] || "Unknown Brand"
          );
          setIsBrandLoading(false);
        }, 500);
      };

      mockFetchBrand();
    }
  }, [brandId]);

  // Form submission handler
  const onSubmit = async (data: LoginFormData) => {
    if (!brandId) {
      toast.error("Brand ID is missing");
      return;
    }

    setIsLoading(true);
    try {
      await login(data.email, data.password, brandId as string);
      toast.success("Login successful!");
      router.push("/");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login. Please try again.");
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

  return (
    <>
      <Head>
        <title>
          {isBrandLoading ? "Login" : `Login to ${brandName}`} | FitBook
        </title>
        <meta name="description" content="Login to your FitBook account" />
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
                <CardTitle className="text-2xl font-bold text-primary">
                  {brandName}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
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
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href={`/register/${brandId}`}
                className="text-primary hover:underline"
              >
                Register
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
