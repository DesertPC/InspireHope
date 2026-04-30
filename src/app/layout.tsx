import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InspireHope Senior Center of Coachella Valley",
  description:
    "Supporting seniors in the Coachella Valley with compassion and dignity. 501(c)(3) nonprofit organization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
