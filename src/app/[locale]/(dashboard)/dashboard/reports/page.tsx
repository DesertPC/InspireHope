import { getDashboardStats } from "@/actions/dashboard.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ReportsPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Financial and activity summaries</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Donations</span>
              <span className="font-medium text-green-600">${stats.totalDonations.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Expenses</span>
              <span className="font-medium text-red-600">${stats.totalExpenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Net Balance</span>
              <span className={`font-bold ${stats.netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {stats.netBalance >= 0 ? "+" : ""}${stats.netBalance.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Seniors</span>
              <span className="font-medium">{stats.seniorsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Cases</span>
              <span className="font-medium">{stats.casesCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
