"use client";

import { useState, useEffect } from "react";
import { getSeniors, deleteSenior } from "@/actions/seniors.actions";
import { SeniorForm } from "./senior-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function SeniorsPage() {
  const router = useRouter();
  const t = useTranslations("dashboard.pages.seniors");
  const [seniors, setSeniors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSenior, setEditingSenior] = useState<any>(null);

  async function loadSeniors() {
    setLoading(true);
    try {
      const data = await getSeniors();
      setSeniors(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSeniors();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await deleteSenior(id);
      await loadSeniors();
    } catch (err) {
      alert("Failed to delete senior");
    }
  }

  function handleView(senior: any) {
    router.push(`/en/dashboard/seniors/${senior.id}`);
  }

  function handleEdit(senior: any) {
    setEditingSenior(senior);
    setFormOpen(true);
  }

  function handleAdd() {
    setEditingSenior(null);
    setFormOpen(true);
  }

  const columns = [
    { header: "Name", cell: (row: any) => `${row.first_name} ${row.last_name}` },
    { header: "Email", accessorKey: "email" },
    { header: "Phone", accessorKey: "phone" },
    { header: "City", accessorKey: "city" },
    {
      header: "Status",
      cell: (row: any) => (
        <Badge variant={row.is_active ? "default" : "secondary"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      cell: (row: any) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
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
          {t("addSenior")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("allSeniors")} ({seniors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">{t("loading")}</p>
          ) : (
            <DataTable columns={columns} data={seniors} keyExtractor={(row) => row.id} onRowClick={(row) => router.push(`/en/dashboard/seniors/${row.id}`)} />
          )}
        </CardContent>
      </Card>

      <SeniorForm
        open={formOpen}
        onOpenChange={setFormOpen}
        senior={editingSenior}
        onSuccess={loadSeniors}
      />
    </div>
  );
}
