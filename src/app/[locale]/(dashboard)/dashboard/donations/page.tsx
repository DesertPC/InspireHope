import { getDonations } from "@/actions/donations.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DonationsPage() {
  const donations = await getDonations();
  const total = donations?.reduce((sum: number, d: any) => sum + (d.amount || 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Donations</h1>
          <p className="text-muted-foreground">Track and manage donations</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">${total.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Donations ({donations?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations?.map((d: any) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.donor_name || "Anonymous"}</TableCell>
                  <TableCell className="text-green-600 font-medium">${d.amount?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{d.donation_type}</Badge>
                  </TableCell>
                  <TableCell>{d.payment_method}</TableCell>
                  <TableCell>{new Date(d.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {(!donations || donations.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No donations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
