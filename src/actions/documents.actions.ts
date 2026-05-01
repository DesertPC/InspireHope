"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  let { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const { error: insertError } = await supabaseAdmin.from("profiles").insert({
      id: user.id,
      email: user.email ?? "",
      full_name: user.user_metadata?.full_name ?? null,
      role: "admin",
    });
    if (insertError) {
      console.error("Auto-create profile error:", insertError);
      throw new Error("Failed to auto-create admin profile");
    }
    profile = { role: "admin" };
  }

  if (profile.role !== "admin") throw new Error("Forbidden");
  return user;
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
  const user = await requireAdmin();

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

  // Get senior_id from case
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

  const { error: uploadError } = await supabaseAdmin.storage
    .from("documents")
    .upload(filePath, file, {
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
    // Attempt to clean up uploaded file
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

  const { error: storageError } = await supabaseAdmin.storage
    .from("documents")
    .remove([doc.file_path]);

  if (storageError) {
    console.error("Storage delete error:", storageError);
    // Continue to try deleting the DB row even if storage delete fails
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
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: doc, error } = await supabaseAdmin
    .from("documents")
    .select("file_path")
    .eq("id", documentId)
    .single();

  if (error || !doc) {
    throw new Error("Document not found");
  }

  const { data: urlData, error: urlError } = await supabaseAdmin.storage
    .from("documents")
    .createSignedUrl(doc.file_path, 60 * 60); // 1 hour

  if (urlError) {
    console.error("Signed URL error:", urlError);
    throw new Error(urlError.message);
  }

  return urlData.signedUrl;
}
