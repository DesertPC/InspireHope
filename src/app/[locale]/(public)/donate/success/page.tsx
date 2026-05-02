"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DonateSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }
    // Give webhook a moment to process
    const timer = setTimeout(() => setStatus("success"), 1500);
    return () => clearTimeout(timer);
  }, [sessionId]);

  return (
    <div className="container mx-auto px-6 py-24 max-w-lg">
      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
              <h2 className="text-2xl font-bold">Processing your donation...</h2>
              <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
              <h2 className="text-2xl font-bold">Thank You!</h2>
              <p className="text-muted-foreground">
                Your donation has been received successfully. A tax receipt will be emailed to you shortly.
              </p>
              <p className="text-sm text-muted-foreground">
                Transaction ID: <span className="font-mono">{sessionId}</span>
              </p>
            </>
          )}
          {status === "error" && (
            <>
              <h2 className="text-2xl font-bold">Something went wrong</h2>
              <p className="text-muted-foreground">
                We couldn&apos;t verify your donation. If you were charged, please contact us at{" "}
                <strong>careisccv@gmail.com</strong>.
              </p>
            </>
          )}
          <Button asChild variant="outline">
            <Link href="/">Return Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
