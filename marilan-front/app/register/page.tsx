"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import LoginIcon from "@mui/icons-material/Login";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
  * { box-sizing: border-box; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-24px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .register-card  { animation: fadeUp  0.55s cubic-bezier(0.22,1,0.36,1) both; }
  .register-brand { animation: slideIn 0.5s  cubic-bezier(0.22,1,0.36,1) 0.08s both; }
  .register-form  { animation: fadeUp  0.55s cubic-bezier(0.22,1,0.36,1) 0.18s both; }

  .marilan-input .MuiOutlinedInput-root {
    border-radius: 10px !important;
    font-family: 'Sora', sans-serif !important;
    font-size: 0.92rem !important;
    background: #fff;
    transition: box-shadow 0.2s;
  }
  .marilan-input .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline { border-color: #F97316 !important; }
  .marilan-input .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline { border-color: #EA6C00 !important; border-width: 2px !important; }
  .marilan-input .MuiOutlinedInput-root.Mui-focused { box-shadow: 0 0 0 3px rgba(249,115,22,0.15) !important; }
  .marilan-input .MuiInputLabel-root.Mui-focused { color: #EA6C00 !important; }
  .marilan-input .MuiInputLabel-root { font-family: 'Sora', sans-serif !important; font-size: 0.88rem !important; }
  .marilan-input .MuiSelect-icon { color: #F97316; }
`;

const roleOptions = [
  { value: "operador",   label: "Operador",       desc: "Abre e acompanha ordens" },
  { value: "manutentor", label: "Manutentor",      desc: "Executa intervenções" },
  { value: "admin",      label: "Administrador",   desc: "Acesso total ao sistema" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [nome,   setNome]   = useState("");
  const [cracha, setCracha] = useState("");
  const [senha,  setSenha]  = useState("");
  const [role,   setRole]   = useState("operador");
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setSuccess(null); setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cracha, senha, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erro ao registrar usuário"); setLoading(false); return; }
      setSuccess("Cadastro realizado com sucesso!");
      setNome(""); setCracha(""); setSenha(""); setRole("operador");
      setLoading(false);
      setTimeout(() => router.push("/"), 1400);
    } catch { setError("Falha ao conectar ao servidor"); setLoading(false); }
  }

  return (
    <>
      <style>{globalStyles}</style>

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
            background: "rgba(28,10,0,0.48)",
            zIndex: 0,
          },
        }}
      >
        <Box
          className="register-card"
          sx={{
            width: { xs: "100%", sm: "520px" },
            borderRadius: "24px",
            overflow: "hidden",
            position: "relative",
            zIndex: 2,
            boxShadow: "0 24px 64px rgba(120,53,15,0.18), 0 4px 16px rgba(120,53,15,0.10)",
            border: "1px solid rgba(249,115,22,0.12)",
          }}
        >
          {/* ── logo / header ── */}
          <Box sx={{ borderBottom: "1px solid rgba(249,115,22,0.12)", lineHeight: 0 }}>
            <Box
              component="img"
              src="/logoMaiorAinda.png"
              alt="Marilan"
              sx={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }}
            />
          </Box>

          {/* ── corpo ── */}
          <Box sx={{ px: { xs: 3, sm: 4 }, py: 4, background: "#fff" }}>
            <Box className="register-brand" sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                <Box sx={{ width: 34, height: 34, borderRadius: "9px", background: "linear-gradient(135deg,#F97316,#EA6C00)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(249,115,22,0.38)" }}>
                  <PersonAddAltIcon sx={{ color: "#fff", fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontFamily: "'Fraunces',serif", fontSize: "1.55rem", fontWeight: 900, color: "#1C0A00", letterSpacing: "-0.01em", lineHeight: 1 }}>
                  Novo cadastro
                </Typography>
              </Box>
              <Typography sx={{ fontFamily: "'Sora',sans-serif", fontSize: "0.84rem", color: "#92400E", mt: 0.5 }}>
                Preencha os dados para criar uma conta no sistema Marilan.
              </Typography>
            </Box>

            {error   && <Alert severity="error"   sx={{ mb: 2.5, fontFamily: "'Sora',sans-serif", borderRadius: "10px" }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2.5, fontFamily: "'Sora',sans-serif", borderRadius: "10px" }}>{success}</Alert>}

            <Box component="form" onSubmit={handleSubmit} className="register-form">
              <Stack spacing={2}>

                <TextField label="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required fullWidth className="marilan-input" />
                <TextField label="Crachá" value={cracha} onChange={(e) => setCracha(e.target.value)} required fullWidth className="marilan-input" />
                <TextField label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required fullWidth className="marilan-input" />

                {/* ── role selector ── */}
                <FormControl fullWidth className="marilan-input">
                  <InputLabel>Perfil de acesso</InputLabel>
                  <Select value={role} label="Perfil de acesso" onChange={(e) => setRole(e.target.value)}>
                    {roleOptions.map((r) => (
                      <MenuItem key={r.value} value={r.value}>
                        <Box>
                          <Typography sx={{ fontFamily: "'Sora',sans-serif", fontSize: "0.88rem", fontWeight: 600, color: "#1C0A00" }}>{r.label}</Typography>
                          <Typography sx={{ fontFamily: "'Sora',sans-serif", fontSize: "0.74rem", color: "#92400E" }}>{r.desc}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* ── submit ── */}
                <Box
                  component="button"
                  type="submit"
                  disabled={loading}
                  sx={{
                    mt: 0.5,
                    width: "100%",
                    background: loading ? "#FDBA74" : "linear-gradient(135deg,#F97316 0%,#EA6C00 100%)",
                    border: "none",
                    borderRadius: "12px",
                    py: "13px",
                    fontFamily: "'Sora',sans-serif",
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    color: "#fff",
                    cursor: loading ? "not-allowed" : "pointer",
                    letterSpacing: "0.02em",
                    boxShadow: "0 4px 16px rgba(249,115,22,0.38)",
                    transition: "transform 0.18s, box-shadow 0.18s",
                    "&:hover:not(:disabled)": { transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(249,115,22,0.44)" },
                    "&:active:not(:disabled)": { transform: "scale(0.98)" },
                  }}
                >
                  {loading ? "Registrando..." : "Criar conta"}
                </Box>

                {/* ── link voltar ── */}
                <Box
                  component="button"
                  type="button"
                  onClick={() => router.push("/")}
                  sx={{
                    background: "transparent",
                    border: "none",
                    fontFamily: "'Sora',sans-serif",
                    fontSize: "0.82rem",
                    color: "#92400E",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                    py: "4px",
                    textDecoration: "none",
                    transition: "color 0.18s",
                    "&:hover": { color: "#EA6C00" },
                  }}
                >
                  <LoginIcon sx={{ fontSize: 14 }} />
                  Já tem conta? Fazer login
                </Box>

              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
