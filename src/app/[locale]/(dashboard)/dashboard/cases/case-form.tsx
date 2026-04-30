"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCase, updateCase } from "@/actions/cases.actions";
import { getSeniors } from "@/actions/seniors.actions";
import type { CaseFormData } from "@/lib/validations/case.schema";

interface CaseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseItem?: any;
  onSuccess: () => void;
}

const serviceTypes = [
  { value: "transportation", label: "Transportation" },
  { value: "housing", label: "Housing" },
  { value: "wellness", label: "Wellness" },
  { value: "case_management", label: "Case Management" },
  { value: "benefits_navigation", label: "Benefits Navigation" },
  { value: "family_crisis", label: "Family Crisis" },
  { value: "funeral_support", label: "Funeral Support" },
  { value: "food_assistance", label: "Food Assistance" },
  { value: "other", label: "Other" },
];

const statuses = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function CaseForm({ open, onOpenChange, caseItem, onSuccess }: CaseFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seniors, setSeniors] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      getSeniors().then(setSeniors).catch(console.error);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data: CaseFormData = {
      seniorId: formData.get("seniorId") as string,
      serviceType: formData.get("serviceType") as any,
      status: (formData.get("status") as any) || "open",
      priority: (formData.get("priority") as any) || "medium",
      description: formData.get("description") as string,
      resourcesMoneyAllocated: Number(formData.get("resourcesMoneyAllocated")) || 0,
      volunteerHoursAllocated: Number(formData.get("volunteerHoursAllocated")) || 0,
      targetDate: formData.get("targetDate") ? new Date(formData.get("targetDate") as string) : undefined,
      outcomeNotes: formData.get("outcomeNotes") as string || undefined,
    };

    try {
      if (caseItem) {
        await updateCase(caseItem.id, data);
      } else {
        await createCase(data);
      }
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{caseItem ? "Edit Case" : "Create New Case"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="seniorId">Senior *</Label>
            <Select name="seniorId" defaultValue={caseItem?.senior_id} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a senior..." />
              </SelectTrigger>
              <SelectContent>
                {seniors.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.last_name}, {s.first_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type *</Label>
              <Select name="serviceType" defaultValue={caseItem?.service_type} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue={caseItem?.priority || "medium"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={caseItem?.status || "open"}>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" name="description" defaultValue={caseItem?.description} required rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resourcesMoneyAllocated">Resources Allocated ($)</Label>
              <Input id="resourcesMoneyAllocated" name="resourcesMoneyAllocated" type="number" step="0.01" defaultValue={caseItem?.resources_money_allocated || 0} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volunteerHoursAllocated">Volunteer Hours Allocated</Label>
              <Input id="volunteerHoursAllocated" name="volunteerHoursAllocated" type="number" step="0.01" defaultValue={caseItem?.volunteer_hours_allocated || 0} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date</Label>
            <Input id="targetDate" name="targetDate" type="date" defaultValue={caseItem?.target_date} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="outcomeNotes">Outcome Notes</Label>
            <Textarea id="outcomeNotes" name="outcomeNotes" defaultValue={caseItem?.outcome_notes} rows={2} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : caseItem ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
