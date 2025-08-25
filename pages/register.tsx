import React, { useEffect } from "react";
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



export default function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  return (
    <>
      <Head>
        <title>Register | FitBook</title>
        <meta name="description" content="Join FitBook - Choose how to get started" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-primary">
              Join FitBook
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose how you'd like to get started
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              {/* Invitation Option */}
              <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold">✉</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">Have an invitation?</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Join your gym or studio with an invitation link
                      </p>
                      <Link href="/invitation">
                        <Button variant="outline" size="sm" className="w-full">
                          Check Invitation
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Brand-specific Registration */}
              <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold">🏢</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">Know your gym?</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        If you have a specific gym's registration link, use it to join directly
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Registration links look like: fitbook.com/register/gym-name
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">
                Need help getting started?
              </p>
              <p className="text-xs text-muted-foreground">
                Contact your gym or fitness studio for an invitation or registration link
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
