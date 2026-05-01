"use client";

import { useState, useEffect } from "react";
import {
  getTestimonials,
  updateTestimonialStatus,
  deleteTestimonial,
} from "@/actions/testimonials.actions";
import { TestimonialForm } from "./testimonial-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Pencil, Trash2, CheckCircle, XCircle, Star } from "lucide-react";

const statusFilters = ["all", "pending", "approved", "rejected"] as const;

type StatusFilter = (typeof statusFilters)[number];

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-muted-foreground text-sm">—</span>;
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");

  async function loadTestimonials() {
    setLoading(true);
    try {
      const data = await getTestimonials();
      setTestimonials(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTestimonials();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await deleteTestimonial(id);
      await loadTestimonials();
    } catch (err) {
      alert("Failed to delete testimonial");
    }
  }

  async function handleStatusChange(id: string, status: "approved" | "rejected") {
    try {
      await updateTestimonialStatus(id, status);
      await loadTestimonials();
    } catch (err) {
      alert("Failed to update status");
    }
  }

  function handleEdit(testimonial: any) {
    setEditingTestimonial(testimonial);
    setFormOpen(true);
  }

  function handleAdd() {
    setEditingTestimonial(null);
    setFormOpen(true);
  }

  const filtered =
    filter === "all"
      ? testimonials
      : testimonials.filter((t) => t.status === filter);

  const columns = [
    { header: "Name", accessorKey: "name" },
    { header: "Email", accessorKey: "email" },
    {
      header: "Content",
      cell: (row: any) => (
        <span className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
          {row.content}
        </span>
      ),
    },
    {
      header: "Rating",
      cell: (row: any) => <StarRating rating={row.rating} />,
    },
    {
      header: "Status",
      cell: (row: any) => {
        const variants: Record<string, string> = {
          pending: "bg-amber-100 text-amber-800 hover:bg-amber-100",
          approved: "bg-green-100 text-green-800 hover:bg-green-100",
          rejected: "bg-red-100 text-red-800 hover:bg-red-100",
        };
        return (
          <Badge className={variants[row.status] || "bg-gray-100 text-gray-800"}>
            {row.status}
          </Badge>
        );
      },
    },
    {
      header: "Created",
      cell: (row: any) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row: any) => (
        <div className="flex gap-1">
          {row.status === "pending" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleStatusChange(row.id, "approved")}
                title="Approve"
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleStatusChange(row.id, "rejected")}
                title="Reject"
              >
                <XCircle className="h-4 w-4 text-red-600" />
              </Button>
            </>
          )}
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
          <h1 className="text-3xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground">
            Review and manage testimonials submitted by applicants
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      <div className="flex gap-2">
        {statusFilters.map((s) => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== "all" && (
              <span className="ml-1 text-xs opacity-70">
                ({testimonials.filter((t) => t.status === s).length})
              </span>
            )}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Testimonials ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : (
            <DataTable
              columns={columns}
              data={filtered}
              keyExtractor={(row) => row.id}
            />
          )}
        </CardContent>
      </Card>

      <TestimonialForm
        open={formOpen}
        onOpenChange={setFormOpen}
        testimonial={editingTestimonial}
        onSuccess={loadTestimonials}
      />
    </div>
  );
}
