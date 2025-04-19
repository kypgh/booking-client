import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";

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
  const [isLoading, setIsLoading] = useState(true);

  // Sample brands data (in a real application, you would fetch this from API)
  const [brands, setBrands] = useState([
    {
      id: "67bb00a19f5bc27ae88e5a53",
      name: "FitBook Gym",
      description: "Your local fitness center",
    },
    {
      id: "67bb04529f5bc27ae88e5a54",
      name: "Yoga Studio",
      description: "Peaceful yoga classes",
    },
    {
      id: "67bb04a19f5bc27ae88e5a55",
      name: "CrossFit Center",
      description: "High intensity training",
    },
  ]);

  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    } else {
      // Simulate loading brands
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
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
              <div className="space-y-3">
                {brands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/login/${brand.id}`}
                    className="block"
                  >
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <h3 className="font-medium">{brand.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {brand.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
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
