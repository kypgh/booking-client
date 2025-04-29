// pages/login.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useBrand, Brand } from "@/contexts/BrandContext";

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

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { setActiveBrandId } = useBrand();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showBrandSelection, setShowBrandSelection] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated && !showBrandSelection) {
      router.push("/");
    }
  }, [isAuthenticated, router, showBrandSelection]);

  // Form submission handler
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await login(data.email, data.password);

      if (
        response?.data?.client?.brands &&
        response.data.client.brands.length > 0
      ) {
        // If user has multiple brands, show the brand selection
        setBrands(response.data.client.brands);
        setShowBrandSelection(true);
        toast.success("Login successful! Please select a brand.");
      } else if (
        response?.data?.client?.brands &&
        response.data.client.brands.length === 1
      ) {
        // If user has only one brand, set it and redirect
        const brandId =
          typeof response.data.client.brands[0] === "string"
            ? response.data.client.brands[0]
            : response.data.client.brands[0]._id ||
              response.data.client.brands[0].id;

        setActiveBrandId(brandId);
        toast.success("Login successful!");
        router.push("/");
      } else {
        // If user has no brands (unusual case)
        toast.success("Login successful!");
        router.push("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle brand selection
  const handleSelectBrand = (brand: Brand) => {
    const brandId = brand._id || brand.id;
    if (brandId) {
      setActiveBrandId(brandId);
      router.push("/");
    }
  };

  if (showBrandSelection)
    return (
      <>
        <Head>
          <title>Choose a Brand | ScheduFit</title>
          <meta name="description" content="Select a brand to continue" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
          <div className="w-full max-w-md">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-primary">
                  ScheduFit
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose a brand to continue
                </p>
              </CardHeader>

              <CardContent>
                {brands.length > 0 ? (
                  <div className="space-y-3">
                    {brands.map((brand) => (
                      <Card
                        key={brand._id || brand.id}
                        className="hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => handleSelectBrand(brand)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center">
                            {brand.logo ? (
                              <div className="w-10 h-10 mr-3 rounded-full overflow-hidden">
                                <img
                                  src={brand.logo}
                                  alt={brand.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 mr-3 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                                {brand.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <h3 className="font-medium">{brand.name}</h3>
                              {brand.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {brand.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No brands available</p>
                    <Button className="mt-4" onClick={() => router.push("/")}>
                      Continue
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );

  // Normal login form
  return (
    <>
      <Head>
        <title>Login | ScheduFit</title>
        <meta name="description" content="Login to your ScheduFit account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-primary">
              ScheduFit
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to login
            </p>
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

              <Button type="submit" className="w-full" disabled={isLoading}>
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
            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
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
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
