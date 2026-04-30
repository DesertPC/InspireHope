import { getSeniors } from "@/actions/seniors.actions";
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

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default async function SeniorsPage() {
  const seniors = await getSeniors();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Seniors</h1>
        <p className="text-muted-foreground">Manage senior profiles and records</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Seniors ({seniors?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seniors?.map((senior: any) => (
                <TableRow key={senior.id}>
                  <TableCell className="font-medium">
                    {senior.first_name} {senior.last_name}
                  </TableCell>
                  <TableCell>{senior.email || "—"}</TableCell>
                  <TableCell>{senior.phone || "—"}</TableCell>
                  <TableCell>{senior.city || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={senior.is_active ? "default" : "secondary"}>
                      {senior.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!seniors || seniors.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No seniors found
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
