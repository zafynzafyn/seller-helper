"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEtsySignIn = () => {
    signIn("etsy", { callbackUrl });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full etsy-gradient flex items-center justify-center">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your Seller Helper account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleEtsySignIn}
        >
          <svg
            className="mr-2 h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8.559 2.25c-.174.006-.492.139-.539.688-.028.317-.032.682-.035 1.117-.004.492-.007.965-.123 1.308-.116.344-.387.612-.87.875a.478.478 0 00-.245.42c0 .264.211.479.473.479h.001c.117 0 .227-.044.313-.117.455-.38.78-.8.97-1.28.19-.481.235-1.007.24-1.628.003-.334.006-.635.026-.875.01-.118.023-.2.035-.254.007-.028.012-.045.015-.052.003-.005.002-.005.002-.005l.001.001c.002.001.009.003.02.003h.06c.053.002.162.008.349.019.187.012.433.03.732.058a52.88 52.88 0 012.033.242c.721.101 1.45.223 2.07.37.62.147 1.132.318 1.44.515.308.197.404.386.404.559v9.57c0 .174-.098.368-.416.567-.318.2-.833.368-1.455.512a21.47 21.47 0 01-2.118.355l-.162.02v3.49l.304-.035c.854-.103 1.81-.264 2.753-.512.943-.248 1.883-.586 2.663-1.08.78-.494 1.401-1.137 1.401-2.013v-9.57c0-.869-.611-1.52-1.387-2.018-.776-.498-1.715-.843-2.654-1.1-.938-.258-1.89-.427-2.74-.535-.85-.107-1.598-.16-2.09-.176-.245-.008-.428-.01-.538-.008-.11.002-.154.008-.172.01-.018.002-.018.006-.02.008z" />
          </svg>
          Continue with Etsy
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            variant="etsy"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <p className="text-sm text-muted-foreground text-center">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <Suspense fallback={<div className="w-full max-w-md h-96 animate-pulse bg-card rounded-lg" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
