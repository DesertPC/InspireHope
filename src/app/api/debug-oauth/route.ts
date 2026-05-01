import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Build the Supabase Auth authorize URL exactly as the client does
  const authorizeUrl = new URL(`${supabaseUrl}/auth/v1/authorize`);
  authorizeUrl.searchParams.set("provider", "google");
  authorizeUrl.searchParams.set("redirect_to", `${supabaseUrl}/auth/v1/callback`);

  try {
    const response = await fetch(authorizeUrl.toString(), {
      method: "GET",
      headers: {
        "apikey": anonKey,
        "Authorization": `Bearer ${anonKey}`,
      },
      redirect: "manual",
    });

    const location = response.headers.get("location");
    const bodyText = await response.text().catch(() => null);

    return NextResponse.json({
      test: "Supabase Auth /authorize endpoint",
      url: authorizeUrl.toString(),
      status: response.status,
      statusText: response.statusText,
      location,
      bodyPreview: bodyText ? bodyText.substring(0, 500) : null,
      headers: Object.fromEntries(response.headers.entries()),
    });
  } catch (err: any) {
    return NextResponse.json({
      test: "Supabase Auth /authorize endpoint",
      url: authorizeUrl.toString(),
      error: err.message,
    });
  }
}
