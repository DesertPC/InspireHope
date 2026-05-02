"use client";

import { useState, useEffect } from "react";
import { getExpenses, deleteExpense } from "@/actions/expenses.actions";
import { ExpenseForm } from "./expense-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ExpensesPage() {
  const t = useTranslations("dashboard.pages.expenses");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  async function loadExpenses() {
    setLoading(true);
    try {
      const data = await getExpenses();
      setExpenses(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await deleteExpense(id);
      await loadExpenses();
    } catch (err) {
      alert("Failed to delete expense");
    }
  }

  function handleEdit(e: any) {
    setEditingExpense(e);
    setFormOpen(true);
  }

  function handleAdd() {
    setEditingExpense(null);
    setFormOpen(true);
  }

  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const columns = [
    { header: "Description", accessorKey: "description" },
    {
      header: "Amount",
      cell: (row: any) => <span className="text-red-600 font-medium">${row.amount?.toLocaleString()}</span>,
    },
    { header: "Category", cell: (row: any) => <Badge variant="outline">{row.category}</Badge> },
    { header: "Payment", accessorKey: "payment_method" },
    {
      header: "Linked Case",
      cell: (row: any) =>
        row.cases ? `${row.cases.case_number}` : "—",
    },
    { header: "Date", accessorKey: "expense_date" },
    {
      header: "Actions",
      cell: (row: any) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-red-600">${total.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">{t("total")}</div>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("allExpenses")} ({expenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">{t("loading")}</p>
          ) : (
            <DataTable columns={columns} data={expenses} keyExtractor={(row) => row.id} />
          )}
        </CardContent>
      </Card>

      <ExpenseForm key={editingExpense?.id || "new"} open={formOpen} onOpenChange={setFormOpen} expense={editingExpense} onSuccess={loadExpenses} />
    </div>
  );
}
