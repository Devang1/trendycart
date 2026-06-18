"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, registerSchema } from "@/lib/validations";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl =
    requestedCallbackUrl?.startsWith("/") && !requestedCallbackUrl.startsWith("//")
      ? requestedCallbackUrl
      : "/";
  const schema = mode === "login" ? loginSchema : registerSchema;
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  async function onSubmit(values: z.infer<typeof schema>) {
    if (mode === "register") {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      if (!response.ok) {
        toast.error((await response.json()).error ?? "Registration failed");
        return;
      }
    }

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false
    });

    if (result?.error) toast.error("Invalid email or password");
    else router.push(callbackUrl);
  }

  return (
    <div className="container grid min-h-[calc(100vh-8rem)] place-items-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === "login" ? "Welcome back" : "Create your account"}</CardTitle>
          <CardDescription>Use your email and password to continue to TrendyCart.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {mode === "register" ? (
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...form.register("name" as never)} />
              </div>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form.register("password")} />
            </div>
            <Button type="submit">{mode === "login" ? "Login" : "Register"}</Button>
          </form>
          <div className="mt-4 flex justify-end text-sm text-muted-foreground">
            <Link href={mode === "login" ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}` : `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
              {mode === "login" ? "Create account" : "Login instead"}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
