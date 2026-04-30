"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@/lib/supabase/client";

export function useDonations() {
  const supabase = useSupabaseClient();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDonations() {
      const { data } = await supabase.from("donations").select("*").order("created_at", { ascending: false });
      setDonations(data as never[]);
      setLoading(false);
    }
    fetchDonations();
  }, [supabase]);

  return { donations, loading };
}
