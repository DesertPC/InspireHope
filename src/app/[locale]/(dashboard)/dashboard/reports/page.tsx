"use client";

import { useState, useEffect } from "react";
import { getDashboardStats, getMonthlyFinancials } from "@/actions/dashboard.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, m] = await Promise.all([getDashboardStats(), getMonthlyFinancials()]);
        setStats(s);
        setMonthly(m);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

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
              <span className="font-medium text-green-600">${stats?.totalDonations?.toLocaleString() ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Expenses</span>
              <span className="font-medium text-red-600">${stats?.totalExpenses?.toLocaleString() ?? 0}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Net Balance</span>
              <span className={`font-bold ${(stats?.netBalance ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                {(stats?.netBalance ?? 0) >= 0 ? "+" : ""}${stats?.netBalance?.toLocaleString() ?? 0}
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
              <span className="font-medium">{stats?.seniorsCount ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Cases</span>
              <span className="font-medium">{stats?.casesCount ?? 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {monthly.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Donations vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="donations" name="Donations" fill="#22c55e" />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
