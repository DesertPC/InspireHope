import { getExpenses } from "@/actions/expenses.actions";
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

export default async function ExpensesPage() {
  const expenses = await getExpenses();
  const total = expenses?.reduce((sum: number, e: any) => sum + (e.amount || 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">Manage organizational expenses</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-red-600">${total.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Expenses ({expenses?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses?.map((e: any) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.description}</TableCell>
                  <TableCell className="text-red-600 font-medium">${e.amount?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{e.category}</Badge>
                  </TableCell>
                  <TableCell>{e.payment_method}</TableCell>
                  <TableCell>{new Date(e.expense_date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {(!expenses || expenses.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No expenses found
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
