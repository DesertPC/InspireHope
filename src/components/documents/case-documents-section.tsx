"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  uploadDocument,
  deleteDocument,
  getDocumentDownloadUrl,
} from "@/actions/documents.actions";
import { FileUp, Download, Trash2, FileText } from "lucide-react";

const categoryLabels: Record<string, string> = {
  id_copy: "ID Copy",
  form: "Form",
  photo: "Photo",
  medical_record: "Medical Record",
  legal: "Legal",
  receipt: "Receipt",
  correspondence: "Correspondence",
  other: "Other",
};

const categoryColors: Record<string, string> = {
  id_copy: "bg-blue-100 text-blue-800",
  form: "bg-green-100 text-green-800",
  photo: "bg-purple-100 text-purple-800",
  medical_record: "bg-red-100 text-red-800",
  legal: "bg-orange-100 text-orange-800",
  receipt: "bg-yellow-100 text-yellow-800",
  correspondence: "bg-teal-100 text-teal-800",
  other: "bg-gray-100 text-gray-800",
};

function formatBytes(bytes: number | null) {
  if (bytes == null) return "—";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

interface DocumentRow {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number | null;
  document_category: string;
  description: string | null;
  created_at: string;
}

interface CaseDocumentsSectionProps {
  documents: DocumentRow[];
  caseId: string;
  isAdmin: boolean;
}

export function CaseDocumentsSection({
  documents,
  caseId,
  isAdmin,
}: CaseDocumentsSectionProps) {
  const router = useRouter();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file || !category) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    formData.append("description", description);

    startTransition(async () => {
      try {
        await uploadDocument(formData, caseId);
        setIsUploadOpen(false);
        setCategory("");
        setDescription("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Upload failed");
      }
    });
  }

  async function handleDelete(docId: string) {
    if (!confirm("Are you sure you want to delete this document?")) return;

    startTransition(async () => {
      try {
        await deleteDocument(docId);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  async function handleDownload(docId: string) {
    startTransition(async () => {
      try {
        const url = await getDocumentDownloadUrl(docId);
        window.open(url, "_blank");
      } catch (err) {
        alert(err instanceof Error ? err.message : "Download failed");
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documents ({documents.length})</CardTitle>
        {isAdmin && (
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <FileUp className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doc-file">File</Label>
                  <Input
                    id="doc-file"
                    ref={fileInputRef}
                    type="file"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-category">Category</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger id="doc-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-description">Description</Label>
                  <Input
                    id="doc-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUploadOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending || !category}>
                    {isPending ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No documents yet
          </p>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium truncate max-w-[200px]">
                          {doc.file_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={categoryColors[doc.document_category] || "bg-gray-100 text-gray-800"}>
                        {categoryLabels[doc.document_category] || doc.document_category}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatBytes(doc.file_size)}</TableCell>
                    <TableCell>
                      {new Date(doc.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(doc.id)}
                          disabled={isPending}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(doc.id)}
                            disabled={isPending}
                            className="text-destructive hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
