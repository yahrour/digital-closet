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
import { signUpSchema } from "@/schemas";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import { redirect } from "next/navigation";

type signUpSchemaType = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const { data: session, isPending } = authClient.useSession();
  const form = useForm<signUpSchemaType>({
    resolver: zodResolver(signUpSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const [error, setError] = useState<{ message: string | undefined }>({
    message: undefined,
  });

  const onSubmit = async (formData: signUpSchemaType) => {
    const { error } = await authClient.signUp.email(
      {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          form.reset();
          setError({ message: undefined });
        },
      },
    );

    if (error !== null) {
      switch (error?.code) {
        case "PASSWORD_TOO_SHORT":
          form.setError("password", {
            type: "custom",
            message: "password too short",
          });
          break;
        case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
          form.setError("email", {
            type: "custom",
            message: "email already exist",
          });
          break;
        default:
          setError({
            message:
              "One or more input values are invalid. Please check and try again.",
          });
      }
    }
  };

  if (isPending) {
    return <LoadingSpinner />;
  }

  if (session?.user) {
    redirect("/");
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full max-w-125 space-y-4 absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]"
    >
      <FieldSet>
        <FieldLegend>Sign Up</FieldLegend>
        <FieldDescription>
          Sign up to organize, style, and keep track of everything you wear.
        </FieldDescription>
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id="name"
                  autoComplete="off"
                  placeholder="John Doe"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
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
              </Field>
            )}
          />

          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="confirmPassword">
                  Confirm Password
                </FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id="confirmPassword"
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
        Already have an account?
        <Link
          href="/signIn"
          className="pl-2 font-medium text-blue-600 hover:text-blue-500"
        >
          Sign In
        </Link>
      </p>
    </form>
  );
}
