"use client";

import { useEffect, useState } from "react";

type CurrentUser = { name: string; email: string } | null;

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => setUser(body?.user ?? null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
