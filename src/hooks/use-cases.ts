"use client";

import { useEffect, useState } from "react";
import { getCases } from "@/actions/cases.actions";

export function useCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getCases()
      .then((data) => setCases(data as never[]))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { cases, loading, error };
}
