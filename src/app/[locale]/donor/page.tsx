import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { getMyDonations } from "@/actions/donations.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DonorPortalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { profile } = await requireAuth(locale);

  if (profile?.role !== "donor") {
    redirect(`/${locale}/dashboard`);
  }

  const donations = await getMyDonations();
  const total = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

  const statusVariant: Record<string, string> = {
    pending: "secondary",
    succeeded: "default",
    failed: "destructive",
    refunded: "outline",
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Donations</h1>
        <p className="text-muted-foreground">View your donation history and receipts</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Donated</div>
            <div className="text-2xl font-bold text-green-600">${total.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Donations</div>
            <div className="text-2xl font-bold">{donations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Recurring</div>
            <div className="text-2xl font-bold">{donations.filter((d) => d.is_recurring).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Donation History</CardTitle>
        </CardHeader>
        <CardContent>
          {donations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No donations found.</p>
          ) : (
            <div className="space-y-3">
              {donations.map((d: any) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between border rounded-lg p-4"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{d.donation_type}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(d.created_at).toLocaleDateString()} · {d.currency}
                    </div>
                    {d.message && (
                      <div className="text-sm text-muted-foreground italic">
                        &ldquo;{d.message}&rdquo;
                      </div>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-lg font-bold text-green-600">
                      ${d.amount?.toLocaleString()}
                    </div>
                    <Badge variant={(statusVariant[d.payment_status] as any) || "default"}>
                      {d.payment_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
