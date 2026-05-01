import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import {
  getMyCase,
  getMyCaseNotes,
  getMyCaseActivities,
  getMyCaseDocuments,
  createCaseRequest,
} from "@/actions/applicant.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, FileText } from "lucide-react";

export default async function MyCasePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { user, profile } = await requireAuth(locale);

  if (profile?.role !== "applicant") {
    redirect(`/${locale}/dashboard`);
  }

  const caseData = await getMyCase();

  if (!caseData) {
    return (
      <div className="container mx-auto px-6 py-24 max-w-3xl text-center">
        <h1 className="text-3xl font-bold mb-4">My Case</h1>
        <p className="text-muted-foreground">
          You don&apos;t have any cases yet. If you recently submitted an application, it may take 1–2 business days to appear.
        </p>
      </div>
    );
  }

  const [notes, activities, documents] = await Promise.all([
    getMyCaseNotes(caseData.id),
    getMyCaseActivities(caseData.id),
    getMyCaseDocuments(caseData.id),
  ]);

  const statusColor: Record<string, string> = {
    open: "bg-red-100 text-red-800",
    in_progress: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Case</h1>
        <p className="text-muted-foreground">Track your application and communicate with our team</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case #{caseData.case_number}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge className={statusColor[caseData.status]}>{caseData.status}</Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Priority</div>
              <Badge variant="outline">{caseData.priority}</Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Service</div>
              <span className="font-medium">{caseData.service_type}</span>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Started</div>
              <span className="font-medium">
                {caseData.start_date ? new Date(caseData.start_date).toLocaleDateString() : "—"}
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Description</div>
            <p className="font-medium">{caseData.description}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCaseRequest} className="space-y-4">
            <input type="hidden" name="case_id" value={caseData.id} />
            <div className="space-y-2">
              <Label htmlFor="content">What do you need?</Label>
              <Textarea
                id="content"
                name="content"
                required
                rows={3}
                placeholder="Describe your request or question..."
              />
            </div>
            <Button type="submit">Submit Request</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Case Notes ({notes.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notes.map((note: any) => (
              <div key={note.id} className="border rounded-lg p-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span className="capitalize">{note.note_type}</span>
                  <span>{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
                <p className="mt-1">{note.content}</p>
              </div>
            ))}
            {notes.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No notes yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activities ({activities.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activities.map((activity: any) => (
              <div key={activity.id} className="border rounded-lg p-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{activity.activity_type}</span>
                  <span>{activity.activity_date}</span>
                </div>
                <p className="mt-1">{activity.description}</p>
                {activity.hours_spent > 0 && (
                  <div className="flex items-center gap-1 text-sm mt-2 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {activity.hours_spent}h
                  </div>
                )}
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No activities yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {documents.map((doc: any) => (
            <div key={doc.id} className="flex items-center gap-3 border rounded-lg p-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">{doc.file_name}</p>
                <p className="text-sm text-muted-foreground">{doc.document_category}</p>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(doc.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
          {documents.length === 0 && (
            <p className="text-muted-foreground text-center py-4">No documents available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
