"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function LoginPage() {
  const router = useRouter();
  const [cracha, setCracha] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cracha, senha }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Erro ao fazer login");
        setLoading(false);
        return;
      }

      localStorage.setItem("marilanUser", JSON.stringify(data));
      if (data.role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/ordens-servico");
      }
    } catch (err) {
      setError("Falha ao conectar ao servidor");
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');

        * { box-sizing: border-box; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.9); opacity: 0.6; }
          50%  { transform: scale(1.05); opacity: 0.3; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }

        .login-card {
          animation: fadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .login-brand {
          animation: slideIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
        }
        .login-form-area {
          animation: fadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
        }

        .marilan-input .MuiOutlinedInput-root {
          border-radius: 10px;
          font-family: 'Sora', sans-serif;
          font-size: 0.95rem;
          background: #fff;
          transition: box-shadow 0.2s;
        }
        .marilan-input .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
          border-color: #F97316;
        }
        .marilan-input .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
          border-color: #EA6C00;
          border-width: 2px;
        }
        .marilan-input .MuiOutlinedInput-root.Mui-focused {
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
        }
        .marilan-input .MuiInputLabel-root.Mui-focused {
          color: #EA6C00;
        }
        .marilan-input .MuiInputLabel-root {
          font-family: 'Sora', sans-serif;
          font-size: 0.9rem;
        }
      `}</style>

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "url('/fundoFront.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          overflow: "hidden",
          px: 2,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: "rgba(28, 10, 0, 0.45)",
            zIndex: 0,
          },
        }}
      >
        <Paper
          className="login-card"
          elevation={0}
          sx={{
            width: "60vw", // ✅ corrigido
            maxWidth: 900,
            borderRadius: "24px",
            overflow: "hidden",
            position: "relative",
            zIndex: 2,
            boxShadow:
              "0 24px 64px rgba(120, 53, 15, 0.12), 0 4px 16px rgba(120, 53, 15, 0.08)",
            border: "1px solid rgba(249, 115, 22, 0.12)",
          }}
        >
          <Box
            sx={{
              borderBottom: "1px solid rgba(249, 115, 22, 0.12)",
              lineHeight: 0,
            }}
          >
            <Box
              component="img"
              src="/logoMaiorAinda.png"
              alt="Marilan"
              sx={{
                width: "100%",
                height: "auto",
                display: "block",
                objectFit: "cover",
              }}
            />
          </Box>

          <Box sx={{ px: 4, py: 4, background: "#fff" }}>
            <Stack spacing={3}>
              <Typography>Bem-vindo de volta</Typography>

              {error && <Alert severity="error">{error}</Alert>}

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="Crachá"
                    value={cracha}
                    onChange={(e) => setCracha(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    fullWidth
                  />

                  <Button type="submit" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </>
  );
}