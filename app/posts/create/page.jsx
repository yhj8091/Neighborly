"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreatePostRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/posts/write");
  }, [router]);

  return null;
}