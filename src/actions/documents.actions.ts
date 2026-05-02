"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") throw new Error("Forbidden");
  return { user, profile };
}

export async function getDocuments() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCaseDocuments(caseId: string) {
  const { data, error } = await supabaseAdmin
    .from("documents")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function uploadDocument(formData: FormData, caseId: string) {
  const user = (await requireAdmin()).user;

  const file = formData.get("file") as File | null;
  const category = formData.get("category") as string;
  const description = (formData.get("description") as string) || null;

  if (!file || !category) {
    throw new Error("File and category are required");
  }

  const allowedCategories = [
    "id_copy",
    "form",
    "photo",
    "medical_record",
    "legal",
    "receipt",
    "correspondence",
    "other",
  ];
  if (!allowedCategories.includes(category)) {
    throw new Error("Invalid document category");
  }

  const { data: caseData, error: caseError } = await supabaseAdmin
    .from("cases")
    .select("senior_id")
    .eq("id", caseId)
    .single();

  if (caseError || !caseData) {
    throw new Error("Case not found");
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `cases/${caseId}/${Date.now()}_${sanitizedName}`;

  // Convert File to ArrayBuffer for reliable upload in Server Actions
  const arrayBuffer = await file.arrayBuffer();

  // Use authenticated client for Storage to comply with RLS policies
  const supabase = await createSupabaseServerClient();
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, arrayBuffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    throw new Error(uploadError.message);
  }

  const { error: insertError } = await supabaseAdmin.from("documents").insert({
    case_id: caseId,
    senior_id: caseData.senior_id,
    file_path: filePath,
    file_name: file.name,
    file_type: file.type || "application/octet-stream",
    file_size: file.size,
    document_category: category,
    description,
    uploaded_by: user.id,
    is_confidential: false,
  });

  if (insertError) {
    await supabaseAdmin.storage.from("documents").remove([filePath]);
    console.error("Document insert error:", insertError);
    throw new Error(insertError.message);
  }

  revalidatePath(`/en/dashboard/cases/${caseId}`);
}

export async function deleteDocument(documentId: string) {
  await requireAdmin();

  const { data: doc, error: fetchError } = await supabaseAdmin
    .from("documents")
    .select("file_path, case_id")
    .eq("id", documentId)
    .single();

  if (fetchError || !doc) {
    throw new Error("Document not found");
  }

  // Use authenticated client for Storage to comply with RLS policies
  const supabase = await createSupabaseServerClient();
  const { error: storageError } = await supabase.storage
    .from("documents")
    .remove([doc.file_path]);

  if (storageError) {
    console.error("Storage delete error:", storageError);
  }

  const { error: deleteError } = await supabaseAdmin
    .from("documents")
    .delete()
    .eq("id", documentId);

  if (deleteError) {
    console.error("Document delete error:", deleteError);
    throw new Error(deleteError.message);
  }

  revalidatePath(`/en/dashboard/cases/${doc.case_id}`);
}

export async function getDocumentDownloadUrl(documentId: string) {
  const user = await getCurrentUser();

  const { data: doc, error } = await supabaseAdmin
    .from("documents")
    .select("file_path")
    .eq("id", documentId)
    .single();

  if (error || !doc) {
    throw new Error("Document not found");
  }

  // Use authenticated client for Storage to comply with RLS policies
  const supabase = await createSupabaseServerClient();
  const { data: urlData, error: urlError } = await supabase.storage
    .from("documents")
    .createSignedUrl(doc.file_path, 60 * 60);

  if (urlError) {
    console.error("Signed URL error:", urlError);
    throw new Error(urlError.message);
  }

  return urlData.signedUrl;
}
