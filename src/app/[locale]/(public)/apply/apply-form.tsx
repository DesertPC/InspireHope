"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSupabaseClient } from "@/lib/supabase/client";

const serviceTypes = [
  { value: "transportation", label: "Transportation" },
  { value: "housing", label: "Housing Assistance" },
  { value: "wellness", label: "Wellness / Health" },
  { value: "case_management", label: "Case Management" },
  { value: "benefits_navigation", label: "Benefits Navigation" },
  { value: "family_crisis", label: "Family Crisis" },
  { value: "funeral_support", label: "Funeral Support" },
  { value: "food_assistance", label: "Food Assistance" },
  { value: "other", label: "Other" },
];

export function ApplyForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabaseClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    try {
      // First create the senior
      const { data: senior, error: seniorError } = await supabase
        .from("seniors")
        .insert({
          first_name: formData.get("firstName"),
          last_name: formData.get("lastName"),
          date_of_birth: formData.get("dateOfBirth") || null,
          phone: formData.get("phone") || null,
          email: formData.get("email") || null,
          address: formData.get("address") || null,
          city: formData.get("city") || "Palm Desert",
          state: formData.get("state") || "CA",
          zip_code: formData.get("zipCode") || "92260",
          emergency_contact_name: formData.get("emergencyContact") || null,
          emergency_contact_phone: formData.get("emergencyPhone") || null,
          housing_status: (formData.get("housingStatus") as string) || null,
          notes: formData.get("notes") || null,
        })
        .select()
        .single();

      if (seniorError) throw seniorError;

      // Then create the case
      const { error: caseError } = await supabase.from("cases").insert({
        senior_id: senior.id,
        service_type: formData.get("serviceType"),
        priority: (formData.get("urgency") as string) || "medium",
        description: formData.get("situation") as string,
        status: "open",
      });

      if (caseError) throw caseError;

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Apply for Services</CardTitle>
          <CardDescription>
            Fill out this form to request assistance from InspireHope Senior Center.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                Application submitted successfully! We will contact you within 2 business days.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Personal Information</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" name="firstName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" name="lastName" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" name="phone" type="tel" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" defaultValue="Palm Desert" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" defaultValue="CA" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP</Label>
                <Input id="zipCode" name="zipCode" defaultValue="92260" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                <Input id="emergencyContact" name="emergencyContact" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                <Input id="emergencyPhone" name="emergencyPhone" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="housingStatus">Housing Status</Label>
              <Select name="housingStatus">
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="at_risk">At Risk</SelectItem>
                  <SelectItem value="homeless">Homeless</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Service Request</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceType">Type of Service Needed *</Label>
              <Select name="serviceType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service..." />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select name="urgency" defaultValue="medium">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low — Within 2 weeks</SelectItem>
                  <SelectItem value="medium">Medium — Within 1 week</SelectItem>
                  <SelectItem value="high">High — Within 48 hours</SelectItem>
                  <SelectItem value="urgent">Urgent — Same day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="situation">Describe Your Situation *</Label>
              <Textarea
                id="situation"
                name="situation"
                required
                rows={4}
                placeholder="Please describe what assistance you need and your current situation..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="Any other information you'd like us to know..."
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
