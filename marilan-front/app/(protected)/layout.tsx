"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CssBaseline } from "@mui/material";
import Topbar from "./components/Topbar";

interface UserData {
  id: number;
  nome: string;
  cracha: string;
  role: string;
  ativo: boolean;
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("marilanUser");
    if (!stored) {
      router.push("/");
      return;
    }

    try {
      setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem("marilanUser");
      router.push("/");
    }
  }, [router]);

  if (!user) return null;

  return (
    <>
      <CssBaseline />
      <Topbar />
      <Box sx={{ minHeight: "calc(100vh - 58px)", bgcolor: "background.default" }}>
        {children}
      </Box>
    </>
  );
}
