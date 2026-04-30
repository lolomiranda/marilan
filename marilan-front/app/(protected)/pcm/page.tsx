"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Container,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import EngineeringIcon from "@mui/icons-material/Engineering";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";

interface RelatorioParada {
  id: number;
  data_abertura: string;
  linha_lote: string;
  motivo: string;
  descricao_problema: string;
  data_inicio: string;
  data_conclusao: string;
  nome_equipamento: string;
  manutentor_nome: string | null;
}

interface MTTRManutentor {
  id: number;
  nome: string;
  mttr_minutos: number;
  total_reparos: number;
}

interface MTBFMaquina {
  id: number;
  nome: string;
  localizacao: string;
  mtbf_horas: number;
  total_paradas: number;
}

interface Metricas {
  mttrPorManutentor: MTTRManutentor[];
  mtbfPorMaquina: MTBFMaquina[];
  disponibilidadePercent: number;
  indisponibilidadePercent: number;
  mtbfVsMttr: { mtbfPercent: number; mttrPercent: number };
}

/* ─── estilos globais ─── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
  * { box-sizing: border-box; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes countUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .pcm-page { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
  .pcm-card { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
  .pcm-card:nth-child(2) { animation-delay: 0.06s; }
  .pcm-card:nth-child(3) { animation-delay: 0.12s; }
  .pcm-card:nth-child(4) { animation-delay: 0.18s; }

  /* tabela */
  .marilan-table thead tr { background: linear-gradient(90deg, #FFF7ED 0%, #FFFBF7 100%) !important; }
  .marilan-table thead th {
    font-family: 'Sora', sans-serif !important;
    font-size: 0.72rem !important;
    font-weight: 700 !important;
    letter-spacing: 0.07em !important;
    text-transform: uppercase !important;
    color: #9A3412 !important;
    border-bottom: 1.5px solid rgba(249,115,22,0.18) !important;
    padding: 13px 14px !important;
    white-space: nowrap;
  }
  .marilan-table tbody tr { transition: background 0.15s; }
  .marilan-table tbody tr:hover { background: #FFF7ED !important; }
  .marilan-table tbody td {
    font-family: 'Sora', sans-serif !important;
    font-size: 0.84rem !important;
    color: #3B1A08 !important;
    border-bottom: 1px solid rgba(249,115,22,0.07) !important;
    padding: 12px 14px !important;
  }
  .marilan-table tbody tr:last-child td { border-bottom: none !important; }

  /* loading spinner */
  .marilan-spinner {
    width: 40px; height: 40px;
    border: 3px solid rgba(249,115,22,0.15);
    border-top-color: #F97316;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

/* ─── gauge circular (SVG) ─── */
const GaugeArc = ({ value, color, label }: { value: number; color: string; label: string }) => {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(249,115,22,0.10)" strokeWidth="6" />
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1)" }}
        />
        <text x="36" y="40" textAnchor="middle" fontFamily="'Sora',sans-serif" fontSize="12" fontWeight="700" fill={color}>
          {value}%
        </text>
      </svg>
      <Typography sx={{ fontFamily: "'Sora',sans-serif", fontSize: "0.72rem", color: "#92400E", fontWeight: 600, letterSpacing: "0.04em" }}>
        {label}
      </Typography>
    </Box>
  );
};

/* ─── card de métrica ─── */
const MetricCard = ({
  label, value, sub, accent, icon,
}: {
  label: string; value: string | number; sub?: string; accent: string; icon: React.ReactNode;
}) => (
  <Box
    className="pcm-card"
    sx={{
      background: "#fff",
      borderRadius: "18px",
      border: "1px solid rgba(249,115,22,0.12)",
      boxShadow: "0 4px 20px rgba(120,53,15,0.07), 0 1px 4px rgba(120,53,15,0.04)",
      p: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 1,
      position: "relative",
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "3px",
        background: accent,
        borderRadius: "18px 18px 0 0",
      },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Typography sx={{ fontFamily: "'Sora',sans-serif", fontSize: "0.72rem", fontWeight: 700, color: "#92400E", letterSpacing: "0.07em", textTransform: "uppercase" }}>
        {label}
      </Typography>
      <Box sx={{ color: accent, opacity: 0.7, display: "flex" }}>{icon}</Box>
    </Box>
    <Typography sx={{ fontFamily: "'Fraunces',serif", fontSize: "2rem", fontWeight: 900, color: "#1C0A00", lineHeight: 1, letterSpacing: "-0.02em", animation: "countUp 0.5s ease both" }}>
      {value}
    </Typography>
    {sub && (
      <Typography sx={{ fontFamily: "'Sora',sans-serif", fontSize: "0.76rem", color: "#A16207" }}>
        {sub}
      </Typography>
    )}
  </Box>
);

/* ─── section paper ─── */
const SectionPaper = ({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: "20px",
      border: "1px solid rgba(249,115,22,0.12)",
      boxShadow: "0 6px 24px rgba(120,53,15,0.07)",
      overflow: "hidden",
    }}
  >
    <Box
      sx={{
        px: 3, py: "16px",
        background: "linear-gradient(90deg, #FFF7ED 0%, #FFFBF7 100%)",
        borderBottom: "1px solid rgba(249,115,22,0.12)",
        display: "flex", alignItems: "center", gap: 1.5,
      }}
    >
      {icon && <Box sx={{ color: "#F97316", display: "flex" }}>{icon}</Box>}
      <Typography sx={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#1C0A00" }}>
        {title}
      </Typography>
    </Box>
    {children}
  </Paper>
);

/* ═══════════════════════ COMPONENTE PRINCIPAL ═══════════════════════ */
export default function PCMPage() {
  const [relatorio, setRelatorio] = useState<RelatorioParada[]>([]);
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const stored = localStorage.getItem("marilanUser");
      if (!stored) { setError("Usuário não autenticado"); setLoading(false); return; }
      const user = JSON.parse(stored);
      const h = { "X-User-Id": String(user.id), "X-User-Role": user.role };

      const [rRes, mRes] = await Promise.all([
        fetch("http://localhost:3001/dashboard/pcm/relatorio", { headers: h }),
        fetch("http://localhost:3001/dashboard/pcm/metricas", { headers: h }),
      ]);
      if (!rRes.ok || !mRes.ok) throw new Error("Erro ao carregar dados");
      setRelatorio(await rRes.json());
      setMetricas(await mRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchData(); }, []);

  const formatData = (d: string) => {
    if (!d) return "-";
    return new Date(d).toLocaleString("pt-BR");
  };

  const formatMinutos = (min: number) => {
    if (!min) return "-";
    const h = Math.floor(min / 60), m = Math.round(min % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  /* ─── loading state ─── */
  if (loading) {
    return (
      <>
        <style>{globalStyles}</style>
        <Box sx={{ minHeight: "100vh", background: "linear-gradient(160deg,#FFFBF7 0%,#FFF7ED 60%,#FFEDD5 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Stack alignItems="center" spacing={2}>
            <Box className="marilan-spinner" />
            <Typography sx={{ fontFamily: "'Sora',sans-serif", fontSize: "0.88rem", color: "#92400E", fontWeight: 500 }}>
              Carregando dados PCM...
            </Typography>
          </Stack>
        </Box>
      </>
    );
  }

  return (
    <>
      <style>{globalStyles}</style>

      <Box
        className="pcm-page"
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #FFFBF7 0%, #FFF7ED 60%, #FFEDD5 100%)",
          py: "48px",
          px: { xs: 2, md: 5 },
        }}
      >
        {/* ── cabeçalho ── */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontFamily: "'Fraunces',serif", fontSize: { xs: "1.7rem", md: "2.1rem" }, fontWeight: 900, color: "#1C0A00", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
            PCM
          </Typography>
          <Typography sx={{ fontFamily: "'Sora',sans-serif", fontSize: "0.88rem", color: "#92400E", mt: 0.5 }}>
            Planejamento e Controle de Manutenção — análise de paradas e indicadores de performance
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, fontFamily: "'Sora',sans-serif", borderRadius: "12px" }}>
            {error}
          </Alert>
        )}

        {/* ── cards de métricas ── */}
        {metricas && (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                label="Disponibilidade"
                value={`${metricas.disponibilidadePercent}%`}
                sub="tempo operacional"
                accent="linear-gradient(135deg,#22C55E,#16A34A)"
                icon={<QueryStatsIcon sx={{ fontSize: 18 }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                label="Indisponibilidade"
                value={`${metricas.indisponibilidadePercent}%`}
                sub="tempo em parada"
                accent="linear-gradient(135deg,#EF4444,#DC2626)"
                icon={<QueryStatsIcon sx={{ fontSize: 18 }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                label="MTBF %"
                value={`${metricas.mtbfVsMttr.mtbfPercent}%`}
                sub="tempo entre falhas"
                accent="linear-gradient(135deg,#F97316,#EA6C00)"
                icon={<PrecisionManufacturingIcon sx={{ fontSize: 18 }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                label="MTTR %"
                value={`${metricas.mtbfVsMttr.mttrPercent}%`}
                sub="tempo médio de reparo"
                accent="linear-gradient(135deg,#3B82F6,#2563EB)"
                icon={<EngineeringIcon sx={{ fontSize: 18 }} />}
              />
            </Grid>
          </Grid>
        )}

        {/* ── gauges visuais MTBF vs MTTR ── */}
        {metricas && (
          <Box
            sx={{
              mb: 4, p: "20px 28px",
              background: "#fff",
              borderRadius: "18px",
              border: "1px solid rgba(249,115,22,0.12)",
              boxShadow: "0 4px 16px rgba(120,53,15,0.06)",
              display: "flex", alignItems: "center", gap: 4,
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography sx={{ fontFamily: "'Sora',sans-serif", fontSize: "0.72rem", fontWeight: 700, color: "#92400E", letterSpacing: "0.07em", textTransform: "uppercase", mb: 1 }}>
                Proporção MTBF × MTTR
              </Typography>
              <Typography sx={{ fontFamily: "'Sora',sans-serif", fontSize: "0.82rem", color: "#78350F", maxWidth: 220 }}>
                Relação entre tempo produtivo e tempo de reparo das máquinas.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
              <GaugeArc value={metricas.mtbfVsMttr.mtbfPercent} color="#F97316" label="MTBF" />
              <GaugeArc value={metricas.mtbfVsMttr.mttrPercent} color="#3B82F6" label="MTTR" />
              <GaugeArc value={metricas.disponibilidadePercent} color="#22C55E" label="Disponib." />
            </Box>
          </Box>
        )}

        <Stack spacing={3}>
          {/* ── relatório de paradas ── */}
          <SectionPaper title="Relatório de Paradas (Quebra)" icon={<QueryStatsIcon sx={{ fontSize: 18 }} />}>
            <TableContainer>
              <Table className="marilan-table" size="small">
                <TableHead>
                  <TableRow>
                    {["Nº Rel.", "Data", "Linha", "Equipamento", "Descrição", "Início", "Fim", "Manutentor"].map((c) => (
                      <TableCell key={c}>{c}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {relatorio.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 5, color: "#A16207 !important", fontFamily: "'Sora',sans-serif !important" }}>
                        Nenhuma parada encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    relatorio.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell sx={{ fontWeight: "700 !important", color: "#EA6C00 !important" }}>#{item.id}</TableCell>
                        <TableCell>{formatData(item.data_abertura).split(" ")[0]}</TableCell>
                        <TableCell>{item.linha_lote || <span style={{ color: "#CBD5E1" }}>—</span>}</TableCell>
                        <TableCell sx={{ fontWeight: "600 !important" }}>{item.nome_equipamento}</TableCell>
                        <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.descricao_problema}
                        </TableCell>
                        <TableCell>{formatData(item.data_inicio)}</TableCell>
                        <TableCell>{formatData(item.data_conclusao)}</TableCell>
                        <TableCell>{item.manutentor_nome || <span style={{ color: "#CBD5E1" }}>—</span>}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </SectionPaper>

          {/* ── MTTR por manutentor ── */}
          {metricas && metricas.mttrPorManutentor.length > 0 && (
            <SectionPaper title="MTTR — Tempo Médio de Reparo por Manutentor" icon={<EngineeringIcon sx={{ fontSize: 18 }} />}>
              <TableContainer>
                <Table className="marilan-table" size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Manutentor</TableCell>
                      <TableCell align="right">MTTR</TableCell>
                      <TableCell align="right">Total de Reparos</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metricas.mttrPorManutentor.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell sx={{ fontWeight: "600 !important" }}>{item.nome}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: "inline-flex", alignItems: "center", gap: "6px", px: "10px", py: "3px", borderRadius: "20px", background: "#EFF6FF", color: "#1D4ED8", fontSize: "0.8rem", fontWeight: 700, fontFamily: "'Sora',sans-serif" }}>
                            {formatMinutos(item.mttr_minutos)}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: "inline-block", px: "10px", py: "3px", borderRadius: "20px", background: "#FFF7ED", color: "#C2410C", fontSize: "0.8rem", fontWeight: 700, fontFamily: "'Sora',sans-serif" }}>
                            {item.total_reparos}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </SectionPaper>
          )}

          {/* ── MTBF por máquina ── */}
          {metricas && metricas.mtbfPorMaquina.length > 0 && (
            <SectionPaper title="MTBF — Tempo Médio Entre Falhas por Máquina" icon={<PrecisionManufacturingIcon sx={{ fontSize: 18 }} />}>
              <TableContainer>
                <Table className="marilan-table" size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Máquina</TableCell>
                      <TableCell>Localização</TableCell>
                      <TableCell align="right">MTBF (horas)</TableCell>
                      <TableCell align="right">Total de Paradas</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metricas.mtbfPorMaquina.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell sx={{ fontWeight: "600 !important" }}>{item.nome}</TableCell>
                        <TableCell>{item.localizacao}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: "inline-flex", alignItems: "center", gap: "4px", px: "10px", py: "3px", borderRadius: "20px", background: "#FFF7ED", color: "#C2410C", fontSize: "0.8rem", fontWeight: 700, fontFamily: "'Sora',sans-serif" }}>
                            {item.mtbf_horas ? (Math.round(item.mtbf_horas * 100) / 100) : "—"}h
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: "inline-block", px: "10px", py: "3px", borderRadius: "20px", background: "#F0FDF4", color: "#166534", fontSize: "0.8rem", fontWeight: 700, fontFamily: "'Sora',sans-serif" }}>
                            {item.total_paradas}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </SectionPaper>
          )}
        </Stack>
      </Box>
    </>
  );
}
