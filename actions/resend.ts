"use server";

import { Resend } from "resend";
import z from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);
type propsType = {
  to: string;
  subject: string;
  text: string;
};

export async function sendEmail({ to, subject, text }: propsType) {
  try {
    const emailSchema = z.object({
      email: z.email(),
    });

    const { data, success } = emailSchema.safeParse({ email: to });
    if (!success) {
      return;
    }

    const { error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [data.email],
      subject,
      text,
      html: text,
    });

    if (error) {
      console.log("resend error: ", error.message);
    }
  } catch (error) {
    console.log("resend error: ", error);
  }
}
