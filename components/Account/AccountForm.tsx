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
import { SessionType } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { accountDetailsSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

type accountDetailsSchemaType = z.infer<typeof accountDetailsSchema>;

export function AccountForm({ session }: { session: SessionType | null }) {
  const form = useForm<accountDetailsSchemaType>({
    resolver: zodResolver(accountDetailsSchema),
    mode: "onSubmit",
    defaultValues: {
      name: session?.user.name,
      email: session?.user.email,
      currentPassword: undefined,
      newPassword: undefined,
    },
  });
  const [message, setMessage] = useState<{
    message: string | undefined;
    isError: boolean;
  } | null>(null);
  const [isPending, setIsPendig] = useState(false);

  const onSubmit = async (formData: accountDetailsSchemaType) => {
    // if name changed update it
    if (session?.user.name !== formData.name) {
      setIsPendig(true);
      const { error } = await authClient.updateUser({
        name: formData.name,
      });
      setIsPendig(false);
      console.log("1)error: ", error);
      if (!error) {
        setMessage({ message: "Name updated.", isError: false });
      }
    }

    // if email changed update it
    if (session?.user.email !== formData.email) {
      setIsPendig(true);
      await authClient.changeEmail({
        newEmail: formData.email,
        callbackURL: "/account",
      });
      setIsPendig(false);
      setMessage({
        message: "Verify your new email to complete the update.",
        isError: false,
      });
    }

    // if new password set update password
    if (formData.newPassword) {
      setIsPendig(true);
      const { error } = await authClient.changePassword({
        currentPassword: formData.currentPassword!,
        newPassword: formData.newPassword,
        revokeOtherSessions: true,
      });
      setIsPendig(false);
      if (!error) {
        setMessage({
          message: "Password updated.",
          isError: false,
        });
      } else {
        switch (error.code) {
          case "INVALID_PASSWORD":
            setMessage({
              message: "Incorrect current password.",
              isError: true,
            });
        }
      }
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4 w-full max-w-125"
    >
      <FieldSet className="w-full">
        <FieldLegend className="md:text-2xl! max-md:text-xl!">
          Account Settings
        </FieldLegend>
        <FieldDescription className="md:text-base">
          Update profile details
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
            name="currentPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="currentPassword">
                  Current password
                </FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  value={undefined}
                  id="currentPassword"
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
            name="newPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="newPassword">new Password</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id="newPassword"
                  value={undefined}
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

      <div>
        {message && message.isError && <FieldError errors={[message]} />}
        {message && !message.isError && (
          <p className="text-green-500 text-xs font-normal">
            {message.message}
          </p>
        )}
      </div>

      <Button
        disabled={!form.formState.isDirty || isPending}
        type="submit"
        className="w-full cursor-pointer"
      >
        Save
      </Button>
    </form>
  );
}
