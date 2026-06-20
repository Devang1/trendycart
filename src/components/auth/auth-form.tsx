"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, registerSchema } from "@/lib/validations";

type AuthFormValues = {
  name?: string;
  email: string;
  password: string;
};

export function AuthForm({
  mode,
}: {
  mode: "login" | "register";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedCallbackUrl = searchParams.get("callbackUrl");

  const callbackUrl =
    requestedCallbackUrl?.startsWith("/") &&
    !requestedCallbackUrl.startsWith("//")
      ? requestedCallbackUrl
      : "/";

  const schema = mode === "login" ? loginSchema : registerSchema;

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const password = form.watch("password");

  async function onSubmit(values: AuthFormValues) {
    try {
      if (mode === "register") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error ?? "Registration failed");
          return;
        }
      }

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
        return;
      }

      toast.success(
        mode === "login"
          ? "Login successful"
          : "Account created successfully"
      );

      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="container grid min-h-[calc(100vh-8rem)] place-items-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {mode === "login"
              ? "Welcome Back 👋"
              : "Create Your Account"}
          </CardTitle>

          <CardDescription>
            Use your email and password to continue to TrendyCart.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4"
          >
            {mode === "register" && (
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>

                <Input
                  id="name"
                  placeholder="John Doe"
                  {...form.register("name")}
                />

                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {String(form.formState.errors.name.message)}
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                autoComplete="email"
                {...form.register("email")}
              />

              {form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {String(form.formState.errors.email.message)}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>

              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                autoComplete={
                  mode === "login"
                    ? "current-password"
                    : "new-password"
                }
                {...form.register("password")}
              />

              {password &&
                password.length > 0 &&
                password.length < 6 && (
                  <p className="text-sm text-amber-500">
                    Password must be at least 6 characters long
                  </p>
                )}

              {form.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {String(form.formState.errors.password.message)}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={
                form.formState.isSubmitting ||
                !password ||
                password.length < 6
              }
              className="w-full"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "login"
                    ? "Logging in..."
                    : "Creating account..."}
                </>
              ) : mode === "login" ? (
                "Login"
              ) : (
                "Register"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}

            <Link
              href={
                mode === "login"
                  ? `/register?callbackUrl=${encodeURIComponent(
                      callbackUrl
                    )}`
                  : `/login?callbackUrl=${encodeURIComponent(
                      callbackUrl
                    )}`
              }
              className="ml-1 font-medium text-primary hover:underline"
            >
              {mode === "login"
                ? "Create account"
                : "Login instead"}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}