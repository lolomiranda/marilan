"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export default function LoginPage() {
  const router = useRouter();
  const [cracha, setCracha] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: { preventDefault(): void }) {
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
    } catch {
      setError("Falha ao conectar ao servidor");
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }

        .login-panel-left {
          animation: fadeIn 0.8s ease both;
        }
        .login-logo {
          animation: float 5s ease-in-out infinite;
        }
        .login-card {
          animation: fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
        }
        .login-title {
          animation: slideRight 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.25s both;
        }
        .login-form-area {
          animation: fadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both;
        }

        .marilan-input .MuiOutlinedInput-root {
          border-radius: 12px;
          font-family: 'Sora', sans-serif;
          font-size: 0.95rem;
          background: #fafafa;
          transition: box-shadow 0.25s, background 0.25s;
        }
        .marilan-input .MuiOutlinedInput-root:hover {
          background: #fff;
        }
        .marilan-input .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
          border-color: #F97316;
        }
        .marilan-input .MuiOutlinedInput-root.Mui-focused {
          background: #fff;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.12);
        }
        .marilan-input .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
          border-color: #EA6C00;
          border-width: 2px;
        }
        .marilan-input .MuiInputLabel-root {
          font-family: 'Sora', sans-serif;
          font-size: 0.9rem;
          color: #6b7280;
        }
        .marilan-input .MuiInputLabel-root.Mui-focused {
          color: #EA6C00;
        }
        .marilan-input .MuiInputAdornment-root svg {
          color: #9ca3af;
          font-size: 1.1rem;
          transition: color 0.2s;
        }
        .marilan-input .MuiOutlinedInput-root.Mui-focused .MuiInputAdornment-root svg {
          color: #EA6C00;
        }

        .login-btn {
          font-family: 'Sora', sans-serif !important;
          font-weight: 600 !important;
          font-size: 0.95rem !important;
          letter-spacing: 0.02em !important;
          text-transform: none !important;
          border-radius: 12px !important;
          padding: 12px 0 !important;
          background: linear-gradient(135deg, #F97316 0%, #EA6C00 60%, #c2550a 100%) !important;
          box-shadow: 0 4px 18px rgba(234, 108, 0, 0.35) !important;
          transition: transform 0.15s, box-shadow 0.15s !important;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px) !important;
          box-shadow: 0 8px 24px rgba(234, 108, 0, 0.45) !important;
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0) !important;
          box-shadow: 0 3px 10px rgba(234, 108, 0, 0.3) !important;
        }
        .login-btn:disabled {
          background: linear-gradient(135deg, #f9a96e 0%, #f08030 100%) !important;
          box-shadow: none !important;
          opacity: 0.75 !important;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.25;
          pointer-events: none;
        }
      `}</style>

      {/* Page wrapper */}
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
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: "rgba(20, 7, 0, 0.55)",
            zIndex: 0,
          },
        }}
      >
        {/* Card */}
        <Paper
          className="login-card"
          elevation={0}
          sx={{
            width: { xs: "92vw", sm: "80vw", md: "62vw" },
            maxWidth: 860,
            borderRadius: "28px",
            overflow: "hidden",
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            boxShadow:
              "0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(249,115,22,0.15)",
          }}
        >
          {/* ── Left panel ── */}
          <Box
            className="login-panel-left"
            sx={{
              flex: { xs: "none", md: "0 0 42%" },
              background:
                "linear-gradient(160deg, #2d0e00 0%, #7c2d00 55%, #b94200 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 4, md: 5 },
              position: "relative",
              overflow: "hidden",
              minHeight: { xs: 180, md: "auto" },
            }}
          >
            {/* decorative orbs */}
            <Box
              className="orb"
              sx={{
                width: 240,
                height: 240,
                background: "#F97316",
                top: -80,
                right: -80,
              }}
            />
            <Box
              className="orb"
              sx={{
                width: 180,
                height: 180,
                background: "#EA6C00",
                bottom: -60,
                left: -60,
              }}
            />

            <Box
              className="login-logo"
              component="img"
              src="/logoMaiorAinda.png"
              alt="Marilan"
              sx={{
                width: { xs: 140, md: "80%" },
                maxWidth: 220,
                objectFit: "contain",
                position: "relative",
                zIndex: 1,
                filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.4))",
              }}
            />

            <Typography
              sx={{
                fontFamily: "'Fraunces', serif",
                color: "rgba(255,255,255,0.55)",
                fontSize: "0.78rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                mt: 3,
                position: "relative",
                zIndex: 1,
                display: { xs: "none", md: "block" },
              }}
            >
              Sistema de Gestão
            </Typography>
          </Box>

          {/* ── Right panel (form) ── */}
          <Box
            sx={{
              flex: 1,
              background: "#fff",
              px: { xs: 3, sm: 5 },
              py: { xs: 4, sm: 5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Stack spacing={0.5} className="login-title" sx={{ mb: 3.5 }}>
              <Typography
                sx={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#EA6C00",
                }}
              >
                Bem-vindo de volta
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: { xs: "1.6rem", sm: "1.9rem" },
                  fontWeight: 900,
                  color: "#1a0a00",
                  lineHeight: 1.15,
                }}
              >
                Faça seu login
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: "0.85rem",
                  color: "#9ca3af",
                  mt: 0.5,
                }}
              >
                Acesse sua conta para continuar.
              </Typography>
            </Stack>

            <Box
              component="form"
              onSubmit={handleSubmit}
              className="login-form-area"
            >
              <Stack spacing={2.5}>
                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      borderRadius: "10px",
                      fontFamily: "'Sora', sans-serif",
                      fontSize: "0.85rem",
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <TextField
                  className="marilan-input"
                  label="Crachá"
                  value={cracha}
                  onChange={(e) => setCracha(e.target.value)}
                  fullWidth
                  required
                  autoComplete="username"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeOutlinedIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  className="marilan-input"
                  label="Senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  fullWidth
                  required
                  autoComplete="current-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  className="login-btn"
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  disableElevation
                >
                  {loading ? (
                    <CircularProgress size={20} sx={{ color: "#fff" }} />
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </Stack>
            </Box>

            <Typography
              sx={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "0.75rem",
                color: "#d1d5db",
                textAlign: "center",
                mt: 4,
              }}
            >
              © {new Date().getFullYear()} Marilan — Todos os direitos reservados
            </Typography>
          </Box>
        </Paper>
      </Box>
    </>
  );
}
