import { getCases } from "@/actions/cases.actions";
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

export default async function CasesPage() {
  const cases = await getCases();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cases</h1>
        <p className="text-muted-foreground">Manage senior cases</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Cases ({cases?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Senior</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Opened</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases?.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.seniors?.first_name} {c.seniors?.last_name}
                  </TableCell>
                  <TableCell>{c.case_type}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "open" ? "destructive" : c.status === "in_progress" ? "default" : "secondary"}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{c.priority}</TableCell>
                  <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {(!cases || cases.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No cases found
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
