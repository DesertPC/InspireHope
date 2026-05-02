import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function DonateCancelPage() {
  return (
    <div className="container mx-auto px-6 py-24 max-w-lg">
      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          <XCircle className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold">Donation Cancelled</h2>
          <p className="text-muted-foreground">
            Your donation was not completed. No charge was made. If you&apos;d like to try again, click below.
          </p>
          <div className="flex gap-2 justify-center">
            <Button asChild variant="outline">
              <Link href="/donate">Try Again</Link>
            </Button>
            <Button asChild>
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
