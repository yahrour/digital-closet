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

export default function SignUp() {
  type signUpSchemaType = z.infer<typeof signUpSchema>;
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

  const onSubmit = (data: signUpSchemaType) => {
    console.log("data: ", data);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full max-w-125 mx-auto mt-20 space-y-5"
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
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>
      <Button type="submit" className="w-full">
        Sign Up
      </Button>
    </form>
  );
}
