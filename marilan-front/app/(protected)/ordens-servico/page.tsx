"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import BuildIcon from "@mui/icons-material/Build";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

interface Ordem {
  id: number;
  maquina_id: number;
  descricao_problema: string;
  operador_id: number;
  prioridade: string;
  motivo: string;
  status: string;
  maquina_nome: string;
  operador_nome: string;
  manutentor_id: number | null;
  manutentor_nome: string | null;
  data_abertura: string;
  tarefa?: string;
  area?: string;
  causa?: string;
  observacoes?: string;
}

interface Maquina {
  id: number;
  nome: string;
}

interface Usuario {
  id: number;
  nome: string;
  role: string;
}

const prioridades = [
  { value: "baixa", label: "Baixa" },
  { value: "normal", label: "Normal" },
  { value: "alta", label: "Alta" },
];

const motivos = [
  { value: "Quebra", label: "Quebra" },
  { value: "Set-up", label: "Set-up" },
  { value: "Troca fer.", label: "Troca fer." },
  { value: "Produção", label: "Produção" },
  { value: "Pequenas paradas", label: "Pequenas paradas" },
  { value: "Velocidade", label: "Velocidade" },
  { value: "Defeito", label: "Defeito" },
  { value: "Programada", label: "Programada" },
  { value: "Gestão", label: "Gestão" },
  { value: "Movimento operacionais", label: "Movimento operacionais" },
  { value: "Organização", label: "Organização" },
  { value: "Logística", label: "Logística" },
  { value: "Medições e ajuste", label: "Medições e ajuste" },
];

const getDefaultDateTimeLocal = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
};

const tarefas = [
  { value: "Inspeção", label: "Inspeção" },
  { value: "Lubrificação", label: "Lubrificação" },
  { value: "Ajuste", label: "Ajuste" },
  { value: "Substituição", label: "Substituição" },
  { value: "Calibração", label: "Calibração" },
  { value: "Limpeza", label: "Limpeza" },
  { value: "Reparo", label: "Reparo" },
  { value: "Instalação", label: "Instalação" },
];

const areas = [
  { value: "Mecânica", label: "Mecânica" },
  { value: "Elétrica", label: "Elétrica" },
  { value: "Eletrônica", label: "Eletrônica" },
];

const causas = [
  { value: "Desgaste", label: "Desgaste" },
  { value: "Falha elétrica", label: "Falha elétrica" },
  { value: "Sobrecarga", label: "Sobrecarga" },
  { value: "Falta de lubrificação", label: "Falta de lubrificação" },
  { value: "Vibração excessiva", label: "Vibração excessiva" },
  { value: "Contaminação", label: "Contaminação" },
  { value: "Erro de operação", label: "Erro de operação" },
  { value: "Falta de manutenção", label: "Falta de manutenção" },
  { value: "Defeito de fabricação", label: "Defeito de fabricação" },
  { value: "Envelhecimento", label: "Envelhecimento" },
  { value: "Choque térmico", label: "Choque térmico" },
  { value: "Outros", label: "Outros" },
];

const statusLiberacaoOptions = [
  { value: "liberada", label: "Liberada" },
  { value: "nao_liberada", label: "Não Liberada" },
  { value: "liberada_com_restricoes", label: "Liberada com Restrições" },
];

/* ─── helpers de formatação ─── */
const formatStatus = (status: string) => {
  switch (status) {
    case "aberta": return "Aberta";
    case "atribuida": return "Atribuída";
    case "em_andamento": return "Em Andamento";
    case "concluida": return "Concluída";
    default: return status;
  }
};
const formatPrioridade = (p: string) => p.charAt(0).toUpperCase() + p.slice(1);

/* ─── chips de status ─── */
const StatusChip = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; bg: string; color: string; dot: string }> = {
    aberta:       { label: "Aberta",       bg: "#FFF7ED", color: "#C2410C", dot: "#F97316" },
    atribuida:    { label: "Atribuída",    bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
    em_andamento: { label: "Em Andamento", bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B" },
    concluida:    { label: "Concluída",    bg: "#F0FDF4", color: "#15803D", dot: "#22C55E" },
  };
  const s = map[status] ?? { label: status, bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" };
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      px: "10px", py: "4px", borderRadius: "20px",
      background: s.bg, fontSize: "0.76rem", fontWeight: 600,
      color: s.color, fontFamily: "'Sora', sans-serif", letterSpacing: "0.01em",
      whiteSpace: "nowrap",
    }}>
      <Box sx={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {s.label}
    </Box>
  );
};

/* ─── chips de prioridade ─── */
const PrioridadeChip = ({ prioridade }: { prioridade: string }) => {
  const map: Record<string, { bg: string; color: string }> = {
    baixa:  { bg: "#F0FDF4", color: "#166534" },
    normal: { bg: "#F0F9FF", color: "#0369A1" },
    alta:   { bg: "#FFF1F2", color: "#BE123C" },
  };
  const s = map[prioridade] ?? { bg: "#F3F4F6", color: "#374151" };
  return (
    <Box sx={{
      display: "inline-block", px: "10px", py: "3px", borderRadius: "20px",
      background: s.bg, color: s.color, fontSize: "0.75rem", fontWeight: 600,
      fontFamily: "'Sora', sans-serif",
    }}>
      {formatPrioridade(prioridade)}
    </Box>
  );
};

/* ─── estilos globais compartilhados ─── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
  * { box-sizing: border-box; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .os-page { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }

  /* inputs Marilan */
  .marilan-input .MuiOutlinedInput-root {
    border-radius: 10px !important;
    font-family: 'Sora', sans-serif !important;
    font-size: 0.9rem !important;
    background: #fff;
    transition: box-shadow 0.2s;
  }
  .marilan-input .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
    border-color: #F97316 !important;
  }
  .marilan-input .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: #EA6C00 !important;
    border-width: 2px !important;
  }
  .marilan-input .MuiOutlinedInput-root.Mui-focused {
    box-shadow: 0 0 0 3px rgba(249,115,22,0.14) !important;
  }
  .marilan-input .MuiInputLabel-root.Mui-focused { color: #EA6C00 !important; }
  .marilan-input .MuiInputLabel-root { font-family: 'Sora', sans-serif !important; font-size: 0.88rem !important; }
  .marilan-input .MuiSelect-icon { color: #F97316; }

  /* dialog */
  .marilan-dialog .MuiDialog-paper {
    border-radius: 20px !important;
    box-shadow: 0 32px 80px rgba(120,53,15,0.14), 0 4px 20px rgba(120,53,15,0.08) !important;
    border: 1px solid rgba(249,115,22,0.10) !important;
    font-family: 'Sora', sans-serif;
    overflow: hidden;
  }
  .marilan-dialog-title {
    background: linear-gradient(135deg, #fff 60%, #FFF7ED 100%);
    border-bottom: 1px solid rgba(249,115,22,0.12) !important;
    padding: 20px 24px !important;
    font-family: 'Sora', sans-serif !important;
    font-weight: 600 !important;
    font-size: 1.05rem !important;
    color: #1C0A00 !important;
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
  }
  .marilan-dialog-actions {
    border-top: 1px solid rgba(249,115,22,0.10) !important;
    padding: 16px 24px !important;
    background: #FAFAFA !important;
    gap: 10px !important;
  }

  /* table */
  .marilan-table thead tr {
    background: linear-gradient(90deg, #FFF7ED 0%, #FFFBF7 100%) !important;
  }
  .marilan-table thead th {
    font-family: 'Sora', sans-serif !important;
    font-size: 0.75rem !important;
    font-weight: 700 !important;
    letter-spacing: 0.07em !important;
    text-transform: uppercase !important;
    color: #9A3412 !important;
    border-bottom: 1.5px solid rgba(249,115,22,0.18) !important;
    padding: 14px 16px !important;
  }
  .marilan-table tbody tr {
    transition: background 0.18s;
  }
  .marilan-table tbody tr:hover {
    background: #FFF7ED !important;
  }
  .marilan-table tbody td {
    font-family: 'Sora', sans-serif !important;
    font-size: 0.86rem !important;
    color: #3B1A08 !important;
    border-bottom: 1px solid rgba(249,115,22,0.07) !important;
    padding: 13px 16px !important;
  }
  .marilan-table tbody tr:last-child td { border-bottom: none !important; }
  .marilan-table tbody .id-cell {
    font-weight: 700 !important;
    color: #EA6C00 !important;
    font-size: 0.82rem !important;
  }
`;

/* ─── botões de ação reutilizáveis ─── */
const ActionButton = ({
  label, icon, onClick, disabled, variant = "aceitar",
}: {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "aceitar" | "iniciar" | "finalizar";
}) => {
  const styles: Record<string, React.CSSProperties> = {
    aceitar: {
      background: "linear-gradient(135deg, #F97316 0%, #EA6C00 100%)",
      color: "#fff",
      boxShadow: "0 2px 8px rgba(249,115,22,0.35)",
    },
    iniciar: {
      background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
      color: "#fff",
      boxShadow: "0 2px 8px rgba(59,130,246,0.30)",
    },
    finalizar: {
      background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
      color: "#fff",
      boxShadow: "0 2px 8px rgba(34,197,94,0.30)",
    },
  };
  return (
    <Box
      component="button"
      onClick={onClick}
      disabled={disabled}
      sx={{
        ...styles[variant],
        border: "none",
        borderRadius: "8px",
        px: 2,
        py: "6px",
        fontSize: "0.78rem",
        fontWeight: 600,
        fontFamily: "'Sora', sans-serif",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        transition: "transform 0.15s, box-shadow 0.15s",
        "&:hover:not(:disabled)": { transform: "translateY(-1px)", filter: "brightness(1.06)" },
        "&:active:not(:disabled)": { transform: "scale(0.97)" },
      }}
    >
      {icon}
      {label}
    </Box>
  );
};

/* ════════════════════════════════════════════
   COMPONENTE PRINCIPAL
════════════════════════════════════════════ */
export default function OrdensServicoPage() {
  const [ordens, setOrdens] = useState<Ordem[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [operadores, setOperadores] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  /* modal criação */
  const [open, setOpen] = useState(false);
  const [maquinaId, setMaquinaId] = useState<number | string>("");
  const [operadorId, setOperadorId] = useState<number | string>("");
  const [descricao, setDescricao] = useState("");
  const [linhaLote, setLinhaLote] = useState("");
  const [dataAbertura, setDataAbertura] = useState(getDefaultDateTimeLocal());
  const [prioridade, setPrioridade] = useState("normal");
  const [motivo, setMotivo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* modal conclusão */
  const [openConclude, setOpenConclude] = useState(false);
  const [selectedOrdem, setSelectedOrdem] = useState<Ordem | null>(null);
  const [acaoRealizada, setAcaoRealizada] = useState("");
  const [tarefa, setTarefa] = useState("");
  const [area, setArea] = useState("");
  const [causa, setCausa] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [statusLiberacao, setStatusLiberacao] = useState("liberada");

  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);

  /* ── fetch ── */
  async function fetchData() {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    const h = { "X-User-Id": String(currentUser.id), "X-User-Role": currentUser.role };
    try {
      const reqs = [
        fetch("http://localhost:3001/ordens-servico", { headers: h }),
        fetch("http://localhost:3001/maquinas", { headers: h }),
      ];
      if (currentUser.role === "admin") reqs.push(fetch("http://localhost:3001/usuarios", { headers: h }));
      const [oRes, mRes, uRes] = await Promise.all(reqs);
      const oData = await oRes.json();
      const mData = await mRes.json();
      if (!oRes.ok) throw new Error(oData.error || "Falha ao carregar ordens");
      if (!mRes.ok) throw new Error(mData.error || "Falha ao carregar máquinas");
      setOrdens(oData);
      setMaquinas(mData);
      if (currentUser.role === "admin") {
        const uData: Usuario[] = await uRes.json();
        setOperadores(uData.filter((u) => u.role === "operador"));
      } else if (currentUser.role === "operador") {
        setOperadorId(currentUser.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem("marilanUser");
    if (stored) { try { setCurrentUser(JSON.parse(stored)); } catch { setCurrentUser(null); } }
  }, []);

  useEffect(() => { if (currentUser) fetchData(); }, [currentUser]);

  /* ── ações ── */
  const handleAccept = async (id: number) => {
    if (!currentUser) return;
    setActionLoadingId(id);
    try {
      const res = await fetch(`http://localhost:3001/ordens-servico/${id}/atribuir`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-User-Id": String(currentUser.id), "X-User-Role": currentUser.role },
        body: JSON.stringify({ manutentor_id: currentUser.id }),
      });
      if (res.ok) await fetchData();
    } finally { setActionLoadingId(null); }
  };

  const handleStart = async (id: number) => {
    setActionLoadingId(id);
    try {
      await fetch(`http://localhost:3001/ordens-servico/${id}/iniciar`, {
        method: "PATCH",
        headers: { "X-User-Id": String(currentUser?.id), "X-User-Role": currentUser?.role || "" },
      });
      await fetchData();
    } finally { setActionLoadingId(null); }
  };

  const handleOpenConclude = (ordem: Ordem) => {
    setSelectedOrdem(ordem);
    setAcaoRealizada(""); setTarefa(""); setArea(""); setCausa(""); setObservacoes(""); setStatusLiberacao("liberada");
    setOpenConclude(true);
  };

  const handleFinishOrder = async () => {
    if (!selectedOrdem || !currentUser) return;
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:3001/ordens-servico/${selectedOrdem.id}/concluir`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-User-Id": String(currentUser.id), "X-User-Role": currentUser.role },
        body: JSON.stringify({ acao_realizada: acaoRealizada, tarefa: tarefa || null, area: area || null, causa: causa || null, observacoes, status_liberacao: statusLiberacao }),
      });
      if (res.ok) { setActionMessage("Ordem concluída com sucesso!"); setOpenConclude(false); await fetchData(); }
    } finally { setSubmitting(false); }
  };

  const handleOpen = () => { setOpen(true); setLinhaLote(""); setDataAbertura(getDefaultDateTimeLocal()); };
  const handleClose = () => {
    setOpen(false);
    setDescricao(""); setMaquinaId(""); setLinhaLote(""); setPrioridade("normal"); setMotivo(""); setDataAbertura(getDefaultDateTimeLocal());
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("http://localhost:3001/ordens-servico", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": String(currentUser?.id), "X-User-Role": currentUser?.role || "" },
        body: JSON.stringify({ maquina_id: Number(maquinaId), linha_lote: linhaLote, descricao_problema: descricao, operador_id: Number(operadorId), prioridade, motivo, data_abertura: dataAbertura }),
      });
      handleClose();
      await fetchData();
    } finally { setSubmitting(false); }
  }

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <>
      <style>{globalStyles}</style>

      <Box
        className="os-page"
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #FFFBF7 0%, #FFF7ED 60%, #FFEDD5 100%)",
          py: "48px",
          px: { xs: 2, md: 5 },
        }}
      >
        {/* ── cabeçalho ── */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: "'Fraunces', serif",
                fontSize: { xs: "1.7rem", md: "2.1rem" },
                fontWeight: 900,
                color: "#1C0A00",
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
              }}
            >
              Ordens de Serviço
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "0.88rem",
                color: "#92400E",
                mt: 0.5,
                fontWeight: 400,
              }}
            >
              Gestão de intervenções corretivas
            </Typography>
          </Box>

          {(currentUser?.role === "admin" || currentUser?.role === "operador") && (
            <Box
              component="button"
              onClick={handleOpen}
              sx={{
                background: "linear-gradient(135deg, #F97316 0%, #EA6C00 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                px: 3,
                py: "12px",
                fontFamily: "'Sora', sans-serif",
                fontWeight: 600,
                fontSize: "0.88rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 16px rgba(249,115,22,0.40), 0 1px 4px rgba(249,115,22,0.20)",
                transition: "transform 0.18s, box-shadow 0.18s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 24px rgba(249,115,22,0.45)",
                },
                "&:active": { transform: "scale(0.97)" },
              }}
            >
              <AddIcon sx={{ fontSize: 18 }} />
              Abrir nova ordem
            </Box>
          )}
        </Box>

        {/* ── feedback ── */}
        {actionMessage && (
          <Alert
            severity="success"
            onClose={() => setActionMessage(null)}
            sx={{
              mb: 3,
              fontFamily: "'Sora', sans-serif",
              borderRadius: "12px",
              border: "1px solid rgba(34,197,94,0.25)",
              "& .MuiAlert-message": { fontWeight: 500 },
            }}
          >
            {actionMessage}
          </Alert>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              fontFamily: "'Sora', sans-serif",
              borderRadius: "12px",
            }}
          >
            {error}
          </Alert>
        )}

        {/* ── tabela ── */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "20px",
            overflow: "hidden",
            border: "1px solid rgba(249,115,22,0.13)",
            boxShadow: "0 8px 32px rgba(120,53,15,0.08), 0 2px 8px rgba(120,53,15,0.04)",
          }}
        >
          <TableContainer>
            <Table className="marilan-table">
              <TableHead>
                <TableRow>
                  {["ID", "Máquina", "Motivo", "Status", "Prioridade", "Problema", "Manutentor", "Ação"].map((col) => (
                    <TableCell key={col} align={col === "Ação" ? "center" : "left"}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5, fontFamily: "'Sora', sans-serif", color: "#9A3412", fontSize: "0.88rem" }}>
                      Carregando ordens...
                    </TableCell>
                  </TableRow>
                ) : ordens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6, fontFamily: "'Sora', sans-serif", color: "#A16207", fontSize: "0.88rem" }}>
                      Nenhuma ordem encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  ordens.map((ordem) => (
                    <TableRow key={ordem.id}>
                      <TableCell className="id-cell">#{ordem.id}</TableCell>
                      <TableCell sx={{ fontWeight: "600 !important" }}>{ordem.maquina_nome}</TableCell>
                      <TableCell>{ordem.motivo}</TableCell>
                      <TableCell><StatusChip status={ordem.status} /></TableCell>
                      <TableCell><PrioridadeChip prioridade={ordem.prioridade} /></TableCell>
                      <TableCell sx={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ordem.descricao_problema}
                      </TableCell>
                      <TableCell>{ordem.manutentor_nome || <span style={{ color: "#CBD5E1" }}>—</span>}</TableCell>
                      <TableCell align="center">
                        {currentUser?.role === "manutentor" && ordem.status === "aberta" ? (
                          <ActionButton label="Aceitar" variant="aceitar" onClick={() => handleAccept(ordem.id)} disabled={actionLoadingId === ordem.id} />
                        ) : currentUser?.role === "manutentor" && ordem.status === "atribuida" && ordem.manutentor_id === currentUser.id ? (
                          <ActionButton label="Iniciar" variant="iniciar" icon={<PlayArrowIcon sx={{ fontSize: 14 }} />} onClick={() => handleStart(ordem.id)} disabled={actionLoadingId === ordem.id} />
                        ) : currentUser?.role === "manutentor" && ordem.status === "em_andamento" && ordem.manutentor_id === currentUser.id ? (
                          <ActionButton label="Finalizar" variant="finalizar" icon={<CheckCircleOutlineIcon sx={{ fontSize: 14 }} />} onClick={() => handleOpenConclude(ordem)} />
                        ) : (
                          <span style={{ color: "#CBD5E1", fontFamily: "'Sora', sans-serif" }}>—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* ════════════════ MODAL: NOVA ORDEM ════════════════ */}
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" className="marilan-dialog">
          <Box className="marilan-dialog-title">
            <BuildIcon sx={{ color: "#F97316", fontSize: 20 }} />
            Abrir nova ordem
            <Box sx={{ ml: "auto" }}>
              <IconButton size="small" onClick={handleClose} sx={{ color: "#92400E" }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <DialogContent sx={{ px: 3, py: 3, background: "#fff" }}>
              <Stack spacing={2}>

                <FormControl fullWidth className="marilan-input">
                  <InputLabel>Máquina</InputLabel>
                  <Select value={maquinaId} label="Máquina" onChange={(e) => setMaquinaId(e.target.value as string)} required>
                    {maquinas.map((m) => <MenuItem key={m.id} value={m.id} sx={{ fontFamily: "'Sora', sans-serif", fontSize: "0.88rem" }}>{m.nome}</MenuItem>)}
                  </Select>
                </FormControl>

                {currentUser?.role === "admin" ? (
                  <FormControl fullWidth className="marilan-input">
                    <InputLabel>Operador</InputLabel>
                    <Select value={operadorId} label="Operador" onChange={(e) => setOperadorId(e.target.value as string)} required>
                      {operadores.map((u) => <MenuItem key={u.id} value={u.id} sx={{ fontFamily: "'Sora', sans-serif", fontSize: "0.88rem" }}>{u.nome}</MenuItem>)}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField label="Operador" value={currentUser?.nome || ""} disabled fullWidth className="marilan-input" />
                )}

                <TextField label="Linha / Lote" value={linhaLote} onChange={(e) => setLinhaLote(e.target.value)} required fullWidth className="marilan-input" />

                <TextField
                  label="Data / Hora de início"
                  type="datetime-local"
                  value={dataAbertura}
                  onChange={(e) => setDataAbertura(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required fullWidth className="marilan-input"
                />

                <FormControl fullWidth className="marilan-input">
                  <InputLabel>Prioridade</InputLabel>
                  <Select value={prioridade} label="Prioridade" onChange={(e) => setPrioridade(e.target.value as string)} required>
                    {prioridades.map((p) => <MenuItem key={p.value} value={p.value} sx={{ fontFamily: "'Sora', sans-serif", fontSize: "0.88rem" }}>{p.label}</MenuItem>)}
                  </Select>
                </FormControl>

                <FormControl fullWidth className="marilan-input">
                  <InputLabel>Motivo</InputLabel>
                  <Select value={motivo} label="Motivo" onChange={(e) => setMotivo(e.target.value as string)} required>
                    {motivos.map((m) => <MenuItem key={m.value} value={m.value} sx={{ fontFamily: "'Sora', sans-serif", fontSize: "0.88rem" }}>{m.label}</MenuItem>)}
                  </Select>
                </FormControl>

                <TextField label="Descrição do problema" multiline rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} required fullWidth className="marilan-input" />

              </Stack>
            </DialogContent>

            <Box className="marilan-dialog-actions" sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Box
                component="button"
                type="button"
                onClick={handleClose}
                sx={{
                  background: "transparent",
                  border: "1.5px solid rgba(249,115,22,0.25)",
                  borderRadius: "10px",
                  px: "20px", py: "9px",
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 500,
                  fontSize: "0.85rem",
                  color: "#92400E",
                  cursor: "pointer",
                  transition: "border-color 0.18s, background 0.18s",
                  "&:hover": { background: "#FFF7ED", borderColor: "#F97316" },
                }}
              >
                Cancelar
              </Box>
              <Box
                component="button"
                type="submit"
                disabled={submitting}
                sx={{
                  background: submitting ? "#FDBA74" : "linear-gradient(135deg, #F97316 0%, #EA6C00 100%)",
                  border: "none",
                  borderRadius: "10px",
                  px: "24px", py: "9px",
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: "#fff",
                  cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: "0 3px 12px rgba(249,115,22,0.35)",
                  transition: "transform 0.15s, box-shadow 0.15s",
                  "&:hover:not(:disabled)": { transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(249,115,22,0.40)" },
                  "&:active:not(:disabled)": { transform: "scale(0.97)" },
                }}
              >
                {submitting ? "Abrindo..." : "Abrir ordem"}
              </Box>
            </Box>
          </Box>
        </Dialog>

        {/* ════════════════ MODAL: CONCLUSÃO ════════════════ */}
        <Dialog open={openConclude} onClose={() => setOpenConclude(false)} fullWidth maxWidth="sm" className="marilan-dialog">
          <Box className="marilan-dialog-title">
            <CheckCircleOutlineIcon sx={{ color: "#22C55E", fontSize: 20 }} />
            Relatório do Manutentor
            <Box
              sx={{
                ml: 1, px: "8px", py: "2px",
                background: "rgba(249,115,22,0.10)",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#EA6C00",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              OS #{selectedOrdem?.id}
            </Box>
            <Box sx={{ ml: "auto" }}>
              <IconButton size="small" onClick={() => setOpenConclude(false)} sx={{ color: "#92400E" }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <DialogContent sx={{ px: 3, py: 3, background: "#fff" }}>
            <Stack spacing={2.5}>

              {/* card do problema */}
              <Box
                sx={{
                  p: "14px 16px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
                  border: "1px solid rgba(249,115,22,0.18)",
                }}
              >
                <Typography sx={{ fontFamily: "'Sora', sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "#9A3412", letterSpacing: "0.08em", textTransform: "uppercase", mb: 0.5 }}>
                  Problema relatado
                </Typography>
                <Typography sx={{ fontFamily: "'Sora', sans-serif", fontSize: "0.88rem", color: "#431407", lineHeight: 1.55 }}>
                  {selectedOrdem?.descricao_problema}
                </Typography>
              </Box>

              <TextField label="Manutentor" value={currentUser?.nome || ""} disabled fullWidth className="marilan-input" />

              <FormControl fullWidth className="marilan-input">
                <InputLabel>Tarefa realizada</InputLabel>
                <Select value={tarefa} label="Tarefa realizada" onChange={(e) => setTarefa(e.target.value as string)}>
                  {tarefas.map((t) => <MenuItem key={t.value} value={t.value} sx={{ fontFamily: "'Sora', sans-serif", fontSize: "0.88rem" }}>{t.label}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth className="marilan-input">
                <InputLabel>Área</InputLabel>
                <Select value={area} label="Área" onChange={(e) => setArea(e.target.value as string)}>
                  {areas.map((a) => <MenuItem key={a.value} value={a.value} sx={{ fontFamily: "'Sora', sans-serif", fontSize: "0.88rem" }}>{a.label}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth className="marilan-input">
                <InputLabel>Causa identificada</InputLabel>
                <Select value={causa} label="Causa identificada" onChange={(e) => setCausa(e.target.value as string)}>
                  {causas.map((c) => <MenuItem key={c.value} value={c.value} sx={{ fontFamily: "'Sora', sans-serif", fontSize: "0.88rem" }}>{c.label}</MenuItem>)}
                </Select>
              </FormControl>

              <TextField
                label="Ação realizada *"
                multiline rows={3}
                value={acaoRealizada}
                onChange={(e) => setAcaoRealizada(e.target.value)}
                required fullWidth className="marilan-input"
                placeholder="Descreva detalhadamente o que foi feito..."
              />

              <TextField
                label="Observações"
                multiline rows={2}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                fullWidth className="marilan-input"
                placeholder="Alguma observação adicional?"
              />

              <FormControl fullWidth className="marilan-input">
                <InputLabel>Status de liberação da máquina</InputLabel>
                <Select value={statusLiberacao} label="Status de liberação da máquina" onChange={(e) => setStatusLiberacao(e.target.value as string)} required>
                  {statusLiberacaoOptions.map((s) => <MenuItem key={s.value} value={s.value} sx={{ fontFamily: "'Sora', sans-serif", fontSize: "0.88rem" }}>{s.label}</MenuItem>)}
                </Select>
              </FormControl>

            </Stack>
          </DialogContent>

          <Box className="marilan-dialog-actions" sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Box
              component="button"
              type="button"
              onClick={() => setOpenConclude(false)}
              sx={{
                background: "transparent",
                border: "1.5px solid rgba(249,115,22,0.25)",
                borderRadius: "10px",
                px: "20px", py: "9px",
                fontFamily: "'Sora', sans-serif",
                fontWeight: 500,
                fontSize: "0.85rem",
                color: "#92400E",
                cursor: "pointer",
                transition: "border-color 0.18s, background 0.18s",
                "&:hover": { background: "#FFF7ED", borderColor: "#F97316" },
              }}
            >
              Cancelar
            </Box>
            <Box
              component="button"
              onClick={handleFinishOrder}
              disabled={!acaoRealizada || submitting}
              sx={{
                background: (!acaoRealizada || submitting) ? "#BBF7D0" : "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
                border: "none",
                borderRadius: "10px",
                px: "24px", py: "9px",
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: "0.83rem",
                color: "#fff",
                cursor: (!acaoRealizada || submitting) ? "not-allowed" : "pointer",
                boxShadow: "0 3px 12px rgba(34,197,94,0.30)",
                letterSpacing: "0.02em",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "transform 0.15s, box-shadow 0.15s",
                "&:hover:not(:disabled)": { transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(34,197,94,0.35)" },
                "&:active:not(:disabled)": { transform: "scale(0.97)" },
              }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
              Concluir e liberar máquina
            </Box>
          </Box>
        </Dialog>
      </Box>
    </>
  );
}
