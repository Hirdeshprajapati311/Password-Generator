"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";

export const useAuthSync = () => {
  const { setUserId, setIsLoading,setUserEmail } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const sync = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/me", { credentials: "include" });

        if (!mounted) return;

        if (res.ok) {
          const data = await res.json();
          setUserId(data.userId);
          setUserEmail(data.email);
        } else {
          setUserId(null);
          setUserEmail(null);
        }
      } catch (err) {
        if (mounted) {
          setUserId(null);
          setUserEmail(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    sync();

    return () => {
      mounted = false;
    };
  }, [setUserId, setIsLoading, setUserEmail]);
}