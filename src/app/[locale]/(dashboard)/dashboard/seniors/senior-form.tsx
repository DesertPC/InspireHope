"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createSenior, updateSenior } from "@/actions/seniors.actions";
import type { SeniorFormData } from "@/lib/validations/senior.schema";

interface SeniorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  senior?: any;
  onSuccess: () => void;
}

const housingOptions = [
  { value: "stable", label: "Stable" },
  { value: "at_risk", label: "At Risk" },
  { value: "homeless", label: "Homeless" },
  { value: "temporary", label: "Temporary" },
];

const incomeOptions = [
  { value: "low", label: "Low" },
  { value: "moderate", label: "Moderate" },
  { value: "above_moderate", label: "Above Moderate" },
];

export function SeniorForm({ open, onOpenChange, senior, onSuccess }: SeniorFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data: SeniorFormData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      dateOfBirth: formData.get("dateOfBirth") ? new Date(formData.get("dateOfBirth") as string) : undefined,
      address: formData.get("address") as string || undefined,
      city: formData.get("city") as string || "Palm Desert",
      state: formData.get("state") as string || "CA",
      zipCode: formData.get("zipCode") as string || "92260",
      phone: formData.get("phone") as string || undefined,
      email: formData.get("email") as string || undefined,
      emergencyContactName: formData.get("emergencyContactName") as string || undefined,
      emergencyContactPhone: formData.get("emergencyContactPhone") as string || undefined,
      primaryNeeds: [],
      languages: ["English"],
      iehpMember: formData.get("iehpMember") === "on",
      iehpId: formData.get("iehpId") as string || undefined,
      housingStatus: (formData.get("housingStatus") as any) || undefined,
      incomeLevel: (formData.get("incomeLevel") as any) || undefined,
      notes: formData.get("notes") as string || undefined,
    };

    try {
      if (senior) {
        await updateSenior(senior.id, data);
      } else {
        await createSenior(data);
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
          <DialogTitle>{senior ? "Edit Senior" : "Add New Senior"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" name="firstName" defaultValue={senior?.first_name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" name="lastName" defaultValue={senior?.last_name} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={senior?.date_of_birth} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={senior?.phone} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={senior?.email} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={senior?.address} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={senior?.city || "Palm Desert"} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" defaultValue={senior?.state || "CA"} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP</Label>
              <Input id="zipCode" name="zipCode" defaultValue={senior?.zip_code || "92260"} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Emergency Contact</Label>
              <Input id="emergencyContactName" name="emergencyContactName" defaultValue={senior?.emergency_contact_name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Emergency Phone</Label>
              <Input id="emergencyContactPhone" name="emergencyContactPhone" defaultValue={senior?.emergency_contact_phone} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="housingStatus">Housing Status</Label>
              <Select name="housingStatus" defaultValue={senior?.housing_status}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {housingOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="incomeLevel">Income Level</Label>
              <Select name="incomeLevel" defaultValue={senior?.income_level}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {incomeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="iehpMember" name="iehpMember" defaultChecked={senior?.iehp_member} />
            <Label htmlFor="iehpMember">IEHP Member</Label>
          </div>

          {senior?.iehp_member && (
            <div className="space-y-2">
              <Label htmlFor="iehpId">IEHP ID</Label>
              <Input id="iehpId" name="iehpId" defaultValue={senior?.iehp_id} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={senior?.notes} rows={3} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : senior ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
