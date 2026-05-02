import { notFound } from "next/navigation";
import { getCase, getCaseNotes, getCaseActivities } from "@/actions/cases.actions";
import { getCaseDocuments } from "@/actions/documents.actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CaseDocumentsSection } from "@/components/documents/case-documents-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, DollarSign, Clock } from "lucide-react";

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;

  let caseData;
  try {
    caseData = await getCase(id);
  } catch {
    notFound();
  }

  const [notes, activities, documents] = await Promise.all([
    getCaseNotes(id),
    getCaseActivities(id),
    getCaseDocuments(id),
  ]);

  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session?.user?.id ?? "")
    .maybeSingle();
  const isAdmin = profile?.role === "admin";

  const statusColor: any = {
    open: "bg-red-100 text-red-800",
    in_progress: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
  };

  const priorityColor: any = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  const totalExpenses = caseData.expenses?.reduce((sum: number, e: any) => sum + (e.amount || 0), 0) ?? 0;
  const totalHours = activities?.reduce((sum: number, a: any) => sum + (a.hours_spent || 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/${locale}/dashboard/cases`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{caseData.case_number}</h1>
          <p className="text-muted-foreground">
            {caseData.seniors?.last_name}, {caseData.seniors?.first_name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Status</div>
            <Badge className={statusColor[caseData.status]}>{caseData.status}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Priority</div>
            <Badge className={priorityColor[caseData.priority]}>{caseData.priority}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Expenses</div>
            <div className="text-xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Volunteer Hours</div>
            <div className="text-xl font-bold">{totalHours.toFixed(1)}h</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Service Type</span>
              <p className="font-medium">{caseData.service_type}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Start Date</span>
              <p className="font-medium">{caseData.start_date}</p>
            </div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Description</span>
            <p className="font-medium">{caseData.description}</p>
          </div>
          {caseData.outcome_notes && (
            <div>
              <span className="text-sm text-muted-foreground">Outcome Notes</span>
              <p className="font-medium">{caseData.outcome_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Case Notes ({notes?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notes?.map((note: any) => (
              <div key={note.id} className="border rounded-lg p-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{note.note_type}</span>
                  <span>{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
                <p className="mt-1">{note.content}</p>
              </div>
            ))}
            {(!notes || notes.length === 0) && (
              <p className="text-muted-foreground text-center py-4">No notes yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activities ({activities?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activities?.map((activity: any) => (
              <div key={activity.id} className="border rounded-lg p-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{activity.activity_type}</span>
                  <span>{activity.activity_date}</span>
                </div>
                <p className="mt-1">{activity.description}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {activity.hours_spent}h
                  </span>
                  {activity.miles_driven > 0 && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {activity.miles_driven} mi
                    </span>
                  )}
                </div>
              </div>
            ))}
            {(!activities || activities.length === 0) && (
              <p className="text-muted-foreground text-center py-4">No activities yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <CaseDocumentsSection
        documents={documents}
        caseId={id}
        isAdmin={isAdmin}
      />
    </div>
  );
}
