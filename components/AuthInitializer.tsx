"use client"
import { useAuthSync } from '@/hooks/useAuthSync';

export const AuthInitializer = () => {
  useAuthSync();
  return null
}

