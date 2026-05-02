"use client";

import { useState, useEffect } from "react";
import { getCases, deleteCase } from "@/actions/cases.actions";
import { CaseForm } from "./case-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function CasesPage() {
  const router = useRouter();
  const t = useTranslations("dashboard.pages.cases");
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<any>(null);

  async function loadCases() {
    setLoading(true);
    try {
      const data = await getCases();
      setCases(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCases();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await deleteCase(id);
      await loadCases();
    } catch (err) {
      alert("Failed to delete case");
    }
  }

  function handleEdit(c: any) {
    setEditingCase(c);
    setFormOpen(true);
  }

  function handleAdd() {
    setEditingCase(null);
    setFormOpen(true);
  }

  const statusVariant: any = {
    open: "destructive",
    in_progress: "default",
    pending: "secondary",
    resolved: "default",
    closed: "secondary",
  };

  const priorityColor: any = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  const columns = [
    { header: "Case #", accessorKey: "case_number" },
    {
      header: "Senior",
      cell: (row: any) => `${row.seniors?.last_name}, ${row.seniors?.first_name}`,
    },
    { header: "Type", accessorKey: "service_type" },
    {
      header: "Status",
      cell: (row: any) => (
        <Badge variant={statusVariant[row.status] || "default"}>{row.status}</Badge>
      ),
    },
    {
      header: "Priority",
      cell: (row: any) => (
        <span className={`text-xs px-2 py-1 rounded-full ${priorityColor[row.priority]}`}>
          {row.priority}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row: any) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/en/dashboard/cases/${row.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
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
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          {t("newCase")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("allCases")} ({cases.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">{t("loading")}</p>
          ) : (
            <DataTable columns={columns} data={cases} keyExtractor={(row) => row.id} onRowClick={(row) => router.push(`/en/dashboard/cases/${row.id}`)} />
          )}
        </CardContent>
      </Card>

      <CaseForm open={formOpen} onOpenChange={setFormOpen} caseItem={editingCase} onSuccess={loadCases} />
    </div>
  );
}
