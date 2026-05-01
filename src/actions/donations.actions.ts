"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { z } from "zod";

const donationSchema = z.object({
  amount: z.number().min(1).max(100000),
  donationType: z.enum(["general", "transportation", "housing", "wellness", "funeral_support", "food_program", "emergency_fund"]),
  isRecurring: z.boolean().default(false),
  donorName: z.string().min(1),
  donorEmail: z.string().email(),
  donorPhone: z.string().optional(),
  message: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  coverFees: z.boolean().default(false),
});

async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const { error: insertError } = await supabaseAdmin.from("profiles").insert({
      id: user.id,
      email: user.email ?? "",
      full_name: user.user_metadata?.full_name ?? null,
      role: "admin",
    });
    if (insertError) {
      console.error("Auto-create profile error:", insertError);
      throw new Error("Failed to auto-create admin profile");
    }
    return { user, profile: { role: "admin" } };
  }

  if (profile.role !== "admin") throw new Error("Forbidden");
  return { user, profile };
}

export async function createDonationCheckout(data: z.infer<typeof donationSchema>) {
  const validated = donationSchema.parse(data);

  let finalAmount = validated.amount;
  let feeAmount = 0;

  if (validated.coverFees) {
    feeAmount = Math.round((validated.amount * 0.022 + 0.30) * 100) / 100;
    finalAmount = validated.amount + feeAmount;
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: validated.isRecurring ? "subscription" : "payment",
    payment_method_types: ["card", "us_bank_account"],
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: {
          name: `Donation - ${validated.donationType}`,
          description: validated.message || "Thank you for supporting InspireHope",
        },
        unit_amount: Math.round(finalAmount * 100),
        ...(validated.isRecurring && { recurring: { interval: "month" } }),
      },
      quantity: 1,
    }],
    metadata: {
      donor_name: validated.donorName,
      donor_email: validated.donorEmail,
      donation_type: validated.donationType,
      is_anonymous: String(validated.isAnonymous),
      fee_covered: String(validated.coverFees),
      fee_amount: String(feeAmount),
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/donate/cancel`,
    customer_email: validated.donorEmail,
  });

  return { sessionId: session.id, url: session.url };
}

export async function getDonations() {
  await requireAdmin();

  const { data, error } = await supabaseAdmin
    .from("donations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getDonations error:", error);
    throw new Error(error.message);
  }

  return data ?? [];
}
