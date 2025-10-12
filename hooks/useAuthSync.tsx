"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";

export const useAuthSync = () => {
  const { setUserId, setIsLoading,setUsername,setUserEmail } = useAuthStore();

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
          setUsername(data.username);
          setUserEmail(data.email);
        } else {
          setUserId(null);
          setUsername(null);
          setUserEmail(null);
        }
      } catch (err) {
        if (mounted) {
          setUserId(null);
          setUsername(null);
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
  }, [setUserId, setIsLoading, setUsername]);
}