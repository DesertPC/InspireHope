import { getDashboardStats } from "@/actions/dashboard.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, FolderOpen, Wallet } from "lucide-react";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    {
      title: "Total Seniors",
      value: stats.seniorsCount,
      description: "Registered seniors",
      icon: Users,
    },
    {
      title: "Active Cases",
      value: stats.casesCount,
      description: "Open cases",
      icon: FolderOpen,
    },
    {
      title: "Total Donations",
      value: `$${stats.totalDonations.toLocaleString()}`,
      description: "Lifetime donations",
      icon: DollarSign,
    },
    {
      title: "Total Expenses",
      value: `$${stats.totalExpenses.toLocaleString()}`,
      description: "Lifetime expenses",
      icon: Wallet,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of InspireHope operations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Net Balance</CardTitle>
          <CardDescription>Donations minus expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${stats.netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
            {stats.netBalance >= 0 ? "+" : ""}${stats.netBalance.toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
