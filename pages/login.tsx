import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useApi";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function LoginIndexPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Use the hook to fetch user profile data including brands
  const { data: userData, isLoading: profileLoading, error } = useUserProfile();

  console.log(userData);

  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Choose a Brand | FitBook</title>
        <meta name="description" content="Select a brand to login" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">
                FitBook
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose a brand to login
              </p>
            </CardHeader>

            <CardContent>
              {error ? (
                <div className="text-center py-4">
                  <p className="text-destructive">Failed to load brands</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.reload()}
                  >
                    Retry
                  </Button>
                </div>
              ) : userData?.brands && userData.brands.length > 0 ? (
                <div className="space-y-3">
                  {userData.brands.map((brand: any) => (
                    <Link
                      key={brand.id || brand._id}
                      href={`/login/${brand.id || brand._id}`}
                      className="block"
                    >
                      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <h3 className="font-medium">{brand.name}</h3>
                          {brand.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {brand.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No brands available</p>
                  <Link href="/register">
                    <Button className="mt-4">Register</Button>
                  </Link>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Register
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
