"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/schemas";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { redirect } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

type signInSchemaType = z.infer<typeof signInSchema>;

export default function SignUp() {
  const [error, setError] = useState<{ message: string | undefined }>({
    message: undefined,
  });

  const form = useForm<signInSchemaType>({
    resolver: zodResolver(signInSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (formData: signInSchemaType) => {
    await authClient.signIn.email(
      {
        email: formData.email,
        password: formData.password,
        callbackURL: "/",
      },
      {
        onError: (err) => setError({ message: err.error.message }),
      },
    );
  };

  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <LoadingSpinner />;
  }
  if (session?.user) {
    redirect("/");
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-4 w-full max-w-125 space-y-4 absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]"
    >
      <FieldSet>
        <FieldLegend>Sign in</FieldLegend>
        <FieldDescription>
          Sign in to access your digital wardrobe and saved outfits.
        </FieldDescription>
        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id="email"
                  autoComplete="off"
                  placeholder="johndoe@mail.com"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id="password"
                  type="password"
                  autoComplete="off"
                  placeholder="· · · · · · · ·"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
                {error && <FieldError errors={[error]} />}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>
      <Button type="submit" className="w-full cursor-pointer">
        Sign Up
      </Button>
      <p className="text-sm text-gray-600">
        Don&apos;t have an account?
        <Link
          href="/signUp"
          className="pl-2 font-medium text-blue-600 hover:text-blue-500"
        >
          Sign In
        </Link>
      </p>
    </form>
  );
}
