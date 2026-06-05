"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Car } from "lucide-react";
import { girisYap, type AuthState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full h-9 transition-transform active:scale-[0.98] font-semibold shadow-sm shadow-primary/10" disabled={pending}>
      {pending ? "Giriş yapılıyor…" : "Giriş Yap"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(girisYap, {
    error: null,
  });

  return (
    <Card className="w-full max-w-sm rounded-xl border bg-card shadow-md">
      <CardHeader className="text-center pb-4 pt-6">
        <div className="flex justify-center mb-3">
          <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Car className="size-6" />
          </div>
        </div>
        <CardTitle className="text-2xl font-black tracking-tight">KAF Motors</CardTitle>
        <CardDescription className="text-xs text-muted-foreground/80 mt-1">Yönetici Paneli Girişi</CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="ornek@kafmotors.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sifre">Şifre</Label>
            <Input
              id="sifre"
              name="sifre"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
