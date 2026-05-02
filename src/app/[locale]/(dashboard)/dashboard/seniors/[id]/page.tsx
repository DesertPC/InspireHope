import { notFound } from "next/navigation";
import { getSenior } from "@/actions/seniors.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function SeniorDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = await params;

  let senior;
  try {
    senior = await getSenior(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/en/dashboard/seniors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {senior.first_name} {senior.last_name}
          </h1>
          <p className="text-muted-foreground">Senior Profile</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Status</div>
            <Badge variant={senior.is_active ? "default" : "secondary"}>
              {senior.is_active ? "Active" : "Inactive"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Housing</div>
            <Badge variant="outline">{senior.housing_status ?? "—"}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Income</div>
            <Badge variant="outline">{senior.income_level ?? "—"}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">IEHP</div>
            <Badge variant="outline">{senior.iehp_member ? "Member" : "Not Member"}</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Date of Birth</span>
              <p className="font-medium">{senior.date_of_birth ?? "—"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Phone</span>
              <p className="font-medium">{senior.phone ?? "—"}</p>
            </div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Email</span>
            <p className="font-medium">{senior.email ?? "—"}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Address</span>
            <p className="font-medium">
              {senior.address ?? "—"}
              {senior.city && `, ${senior.city}`}
              {senior.state && `, ${senior.state}`}
              {senior.zip_code && ` ${senior.zip_code}`}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Name</span>
              <p className="font-medium">{senior.emergency_contact_name ?? "—"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Phone</span>
              <p className="font-medium">{senior.emergency_contact_phone ?? "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {senior.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{senior.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
