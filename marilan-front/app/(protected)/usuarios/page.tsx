"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Container,
  Dialog,
  DialogContent,
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import GroupIcon from "@mui/icons-material/Group";

interface User {
  id: number;
  nome: string;
  cracha: string;
  role: string;
  ativo: boolean;
  created_at: string;
}

const roles = [
  { value: "admin",      label: "Admin" },
  { value: "manutentor", label: "Manutentor" },
  { value: "operador",   label: "Operador" },
];

/* ─── estilos globais ─── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
  * { box-sizing: border-box; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .usuarios-page { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }

  .marilan-table thead tr { background: linear-gradient(90deg,#FFF7ED 0%,#FFFBF7 100%) !important; }
  .marilan-table thead th {
    font-family: 'Sora', sans-serif !important;
    font-size: 0.72rem !important;
    font-weight: 700 !important;
    letter-spacing: 0.07em !important;
    text-transform: uppercase !important;
    color: #9A3412 !important;
    border-bottom: 1.5px solid rgba(249,115,22,0.18) !important;
    padding: 13px 16px !important;
    white-space: nowrap;
  }
  .marilan-table tbody tr { transition: background 0.15s; }
  .marilan-table tbody tr:hover { background: #FFF7ED !important; }
  .marilan-table tbody td {
    font-family: 'Sora', sans-serif !important;
    font-size: 0.85rem !important;
    color: #3B1A08 !important;
    border-bottom: 1px solid rgba(249,115,22,0.07) !important;
    padding: 13px 16px !important;
  }
  .marilan-table tbody tr:last-child td { border-bottom: none !important; }

  /* inputs */
  .marilan-input .MuiOutlinedInput-root {
    border-radius: 10px !important;
    font-family: 'Sora', sans-serif !important;
    font-size: 0.9rem !important;
    background: #fff;
    transition: box-shadow 0.2s;
  }
  .marilan-input .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline { border-color: #F97316 !important; }
  .marilan-input .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline { border-color: #EA6C00 !important; border-width: 2px !important; }
  .marilan-input .MuiOutlinedInput-root.Mui-focused { box-shadow: 0 0 0 3px rgba(249,115,22,0.14) !important; }
  .marilan-input .MuiInputLabel-root.Mui-focused { color: #EA6C00 !important; }
  .marilan-input .MuiInputLabel-root { font-family: 'Sora', sans-serif !important; font-size: 0.88rem !important; }
  .marilan-input .MuiSelect-icon { color: #F97316; }
  .marilan-input .MuiFormHelperText-root { font-family: 'Sora', sans-serif !important; font-size: 0.75rem !important; }

  /* dialog */
  .marilan-dialog .MuiDialog-paper {
    border-radius: 20px !important;
    box-shadow: 0 32px 80px rgba(120,53,15,0.14), 0 4px 20px rgba(120,53,15,0.08) !important;
    border: 1px solid rgba(249,115,22,0.10) !important;
    overflow: hidden;
  }
`;

/* ─── role badge ─── */
const RoleBadge = ({ role }: { role: string }) => {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    admin:      { label: "Admin",      bg: "#FFF7ED", color: "#C2410C" },
    manutentor: { label: "Manutentor", bg: "#EFF6FF", color: "#1D4ED8" },
    operador:   { label: "Operador",   bg: "#F0FDF4", color: "#166534" },
  };
  const s = map[role] ?? { label: role, bg: "#F3F4F6", color: "#6B7280" };
  return (
    <Box sx={{ display: "inline-block", px: "10px", py: "3px", borderRadius: "20px", background: s.bg, color: s.color, fontSize: "0.75rem", fontWeight: 700, fontFamily: "'Sora',sans-serif" }}>
      {s.label}
    </Box>
  );
};

/* ─── status badge ─── */
const StatusBadge = ({ ativo }: { ativo: boolean }) => (
  <Box sx={{
    display: "inline-flex", alignItems: "center", gap: "5px",
    px: "10px", py: "3px", borderRadius: "20px",
    background: ativo ? "#F0FDF4" : "#FEF2F2",
    color: ativo ? "#166534" : "#991B1B",
    fontSize: "0.75rem", fontWeight: 700, fontFamily: "'Sora',sans-serif",
  }}>
    <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: ativo ? "#22C55E" : "#EF4444" }} />
    {ativo ? "Ativo" : "Inativo"}
  </Box>
);

/* ─── botão de ação da tabela ─── */
const TableActionBtn = ({
  label, icon, onClick, variant = "default",
}: {
  label: string; icon: React.ReactNode; onClick: () => void; variant?: "default" | "danger" | "warning";
}) => {
  const styles: Record<string, React.CSSProperties> = {
    default: { background: "transparent", color: "#92400E",  border: "1.5px solid rgba(249,115,22,0.28)" },
    warning: { background: "transparent", color: "#1D4ED8",  border: "1.5px solid rgba(59,130,246,0.28)" },
    danger:  { background: "transparent", color: "#BE123C",  border: "1.5px solid rgba(239,68,68,0.28)" },
  };
  return (
    <Box
      component="button"
      onClick={onClick}
      title={label}
      sx={{
        ...styles[variant],
        borderRadius: "8px",
        px: "10px", py: "6px",
        fontFamily: "'Sora',sans-serif",
        fontWeight: 600,
        fontSize: "0.75rem",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        transition: "background 0.18s, transform 0.15s",
        "&:hover": { background: variant === "danger" ? "#FFF1F2" : variant === "warning" ? "#EFF6FF" : "#FFF7ED", transform: "translateY(-1px)" },
        "&:active": { transform: "scale(0.96)" },
      }}
    >
      {icon}
      {label}
    </Box>
  );
};

/* ═══════════════════════ COMPONENTE PRINCIPAL ═══════════════════════ */
export default function UsuariosPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* modal */
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [cracha, setCracha] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState("operador");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  async function fetchUsers() {
    if (!currentUser) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("http://localhost:3001/usuarios", {
        headers: { "X-User-Id": String(currentUser.id), "X-User-Role": currentUser.role },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Falha ao buscar usuários"); return; }
      setUsers(data);
    } catch { setError("Não foi possível carregar os usuários"); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const stored = localStorage.getItem("marilanUser");
    if (stored) { try { setCurrentUser(JSON.parse(stored)); } catch { localStorage.removeItem("marilanUser"); } }
    setUserLoaded(true);
  }, []);

  useEffect(() => { if (userLoaded && currentUser?.role === "admin") fetchUsers(); }, [currentUser, userLoaded]);

  const openCreate = () => {
    setSelectedUser(null); setIsEditMode(false); setSubmitError(null); setSubmitSuccess(null);
    setNome(""); setCracha(""); setSenha(""); setRole("operador"); setOpen(true);
  };

  const openEdit = (user: User) => {
    setSelectedUser(user); setIsEditMode(true); setSubmitError(null); setSubmitSuccess(null);
    setNome(user.nome); setCracha(user.cracha); setSenha(""); setRole(user.role); setOpen(true);
  };

  const handleClose = () => { setOpen(false); setNome(""); setCracha(""); setSenha(""); setRole("operador"); };

  const handleToggleActive = async (user: User) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`http://localhost:3001/usuarios/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-User-Id": String(currentUser.id), "X-User-Role": currentUser.role },
        body: JSON.stringify({ ativo: !user.ativo }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Falha ao atualizar status"); return; }
      await fetchUsers();
    } catch { setError("Falha ao conectar ao servidor"); }
  };

  const handleDelete = async (user: User) => {
    if (!currentUser) return;
    if (!window.confirm(`Deseja excluir o usuário ${user.nome}?`)) return;
    try {
      const res = await fetch(`http://localhost:3001/usuarios/${user.id}`, {
        method: "DELETE",
        headers: { "X-User-Id": String(currentUser.id), "X-User-Role": currentUser.role },
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Falha ao excluir usuário"); return; }
      await fetchUsers();
    } catch { setError("Falha ao conectar ao servidor"); }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null); setSubmitSuccess(null); setSubmitting(true);
    if (!currentUser || currentUser.role !== "admin") { setSubmitError("Somente admin pode cadastrar ou editar usuários"); setSubmitting(false); return; }
    try {
      const payload: Record<string, unknown> = { nome, role };
      let url = "http://localhost:3001/usuarios", method = "POST";
      if (isEditMode && selectedUser) {
        url = `http://localhost:3001/usuarios/${selectedUser.id}`; method = "PATCH";
        if (senha) payload.senha = senha;
      } else { payload.cracha = cracha; payload.senha = senha; payload.ativo = 1; }
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "X-User-Id": String(currentUser.id), "X-User-Role": currentUser.role },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitError(data.error || "Falha ao salvar usuário"); setSubmitting(false); return; }
      setSubmitSuccess(isEditMode ? "Usuário atualizado com sucesso!" : "Usuário cadastrado com sucesso!");
      setNome(""); setCracha(""); setSenha(""); setRole("operador"); setSelectedUser(null); setIsEditMode(false);
      await fetchUsers();
      setSubmitting(false);
      setTimeout(() => setOpen(false), 900);
    } catch { setSubmitError("Falha ao conectar ao servidor"); setSubmitting(false); }
  }

  /* ─── acesso negado ─── */
  if (userLoaded && currentUser?.role !== "admin") {
    return (
      <>
        <style>{globalStyles}</style>
        <Box sx={{ minHeight: "100vh", background: "linear-gradient(160deg,#FFFBF7 0%,#FFF7ED 60%,#FFEDD5 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Alert severity="error" sx={{ fontFamily: "'Sora',sans-serif", borderRadius: "12px" }}>
            Acesso negado. Apenas administradores podem ver esta página.
          </Alert>
        </Box>
      </>
    );
  }

  return (
    <>
      <style>{globalStyles}</style>

      <Box
        className="usuarios-page"
        sx={{ minHeight: "100vh", background: "linear-gradient(160deg,#FFFBF7 0%,#FFF7ED 60%,#FFEDD5 100%)", py: "48px", px: { xs: 2, md: 5 } }}
      >
        {/* ── cabeçalho ── */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, flexDirection: { xs: "column", sm: "row" }, gap: 2, mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: "12px", background: "linear-gradient(135deg,#F97316,#EA6C00)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(249,115,22,0.35)" }}>
              <GroupIcon sx={{ color: "#fff", fontSize: 22 }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: "'Fraunces',serif", fontSize: { xs: "1.7rem", md: "2.1rem" }, fontWeight: 900, color: "#1C0A00", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
                Usuários
              </Typography>
              <Typography sx={{ fontFamily: "'Sora',sans-serif", fontSize: "0.88rem", color: "#92400E", mt: 0.5 }}>
                Gerencie contas e permissões de acesso
              </Typography>
            </Box>
          </Box>

          <Box
            component="button"
            onClick={openCreate}
            sx={{
              background: "linear-gradient(135deg,#F97316 0%,#EA6C00 100%)",
              color: "#fff", border: "none", borderRadius: "12px",
              px: 3, py: "12px",
              fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: "0.88rem",
              cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px",
              boxShadow: "0 4px 16px rgba(249,115,22,0.40)",
              transition: "transform 0.18s, box-shadow 0.18s",
              "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(249,115,22,0.45)" },
              "&:active": { transform: "scale(0.97)" },
            }}
          >
            <AddIcon sx={{ fontSize: 18 }} />
            Adicionar usuário
          </Box>
        </Box>

        {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, fontFamily: "'Sora',sans-serif", borderRadius: "12px" }}>{error}</Alert>}

        {/* ── tabela ── */}
        <Paper elevation={0} sx={{ borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(249,115,22,0.13)", boxShadow: "0 8px 32px rgba(120,53,15,0.08)" }}>
          <TableContainer>
            <Table className="marilan-table">
              <TableHead>
                <TableRow>
                  {["ID", "Nome", "Crachá", "Perfil", "Status", "Ações"].map((c, i) => (
                    <TableCell key={c} align={i === 5 ? "center" : "left"}>{c}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5, color: "#9A3412 !important", fontFamily: "'Sora',sans-serif !important" }}>Carregando usuários...</TableCell></TableRow>
                ) : users.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: "#A16207 !important", fontFamily: "'Sora',sans-serif !important" }}>Nenhum usuário encontrado.</TableCell></TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell sx={{ fontWeight: "700 !important", color: "#EA6C00 !important", fontSize: "0.82rem !important" }}>#{user.id}</TableCell>
                      <TableCell sx={{ fontWeight: "600 !important" }}>{user.nome}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "inline-block", px: "9px", py: "2px", borderRadius: "6px", background: "rgba(249,115,22,0.08)", color: "#92400E", fontFamily: "'Sora',sans-serif", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.04em" }}>
                          {user.cracha}
                        </Box>
                      </TableCell>
                      <TableCell><RoleBadge role={user.role} /></TableCell>
                      <TableCell><StatusBadge ativo={user.ativo} /></TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                          <TableActionBtn label="Editar" icon={<EditOutlinedIcon sx={{ fontSize: 14 }} />} onClick={() => openEdit(user)} />
                          <TableActionBtn
                            label={user.ativo ? "Desabilitar" : "Habilitar"}
                            icon={user.ativo ? <PersonOffOutlinedIcon sx={{ fontSize: 14 }} /> : <PersonOutlinedIcon sx={{ fontSize: 14 }} />}
                            onClick={() => handleToggleActive(user)}
                            variant="warning"
                          />
                          <TableActionBtn label="Excluir" icon={<DeleteOutlineIcon sx={{ fontSize: 14 }} />} onClick={() => handleDelete(user)} variant="danger" />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* ════════ MODAL ════════ */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" className="marilan-dialog">
        {/* header */}
        <Box sx={{
          px: 3, py: "18px",
          background: "linear-gradient(135deg,#fff 60%,#FFF7ED 100%)",
          borderBottom: "1px solid rgba(249,115,22,0.12)",
          display: "flex", alignItems: "center", gap: 1.5,
        }}>
          <Box sx={{ width: 32, height: 32, borderRadius: "8px", background: "linear-gradient(135deg,#F97316,#EA6C00)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GroupIcon sx={{ color: "#fff", fontSize: 16 }} />
          </Box>
          <Typography sx={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#1C0A00", flex: 1 }}>
            {isEditMode ? `Editar usuário — ${selectedUser?.nome}` : "Novo usuário"}
          </Typography>
          <IconButton size="small" onClick={handleClose} sx={{ color: "#92400E" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent sx={{ px: 3, py: 3, background: "#fff" }}>
            <Stack spacing={2.5}>
              {submitError  && <Alert severity="error"   sx={{ fontFamily: "'Sora',sans-serif", borderRadius: "10px" }}>{submitError}</Alert>}
              {submitSuccess && <Alert severity="success" sx={{ fontFamily: "'Sora',sans-serif", borderRadius: "10px" }}>{submitSuccess}</Alert>}

              <TextField label="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required fullWidth className="marilan-input" />
              <TextField label="Crachá" value={cracha} onChange={(e) => setCracha(e.target.value)} required={!isEditMode} disabled={isEditMode} fullWidth className="marilan-input" />
              <TextField
                label="Senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required={!isEditMode}
                helperText={isEditMode ? "Deixe em branco para manter a senha atual." : undefined}
                fullWidth
                className="marilan-input"
              />
              <FormControl fullWidth className="marilan-input">
                <InputLabel>Perfil de acesso</InputLabel>
                <Select value={role} label="Perfil de acesso" onChange={(e) => setRole(e.target.value)}>
                  {roles.map((r) => (
                    <MenuItem key={r.value} value={r.value} sx={{ fontFamily: "'Sora',sans-serif", fontSize: "0.88rem" }}>{r.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>

          {/* footer */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "10px", px: 3, py: "16px", borderTop: "1px solid rgba(249,115,22,0.10)", background: "#FAFAFA" }}>
            <Box
              component="button" type="button" onClick={handleClose}
              sx={{ background: "transparent", border: "1.5px solid rgba(249,115,22,0.25)", borderRadius: "10px", px: "20px", py: "9px", fontFamily: "'Sora',sans-serif", fontWeight: 500, fontSize: "0.85rem", color: "#92400E", cursor: "pointer", transition: "border-color 0.18s,background 0.18s", "&:hover": { background: "#FFF7ED", borderColor: "#F97316" } }}
            >
              Cancelar
            </Box>
            <Box
              component="button" type="submit" disabled={submitting}
              sx={{ background: submitting ? "#FDBA74" : "linear-gradient(135deg,#F97316 0%,#EA6C00 100%)", border: "none", borderRadius: "10px", px: "24px", py: "9px", fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "#fff", cursor: submitting ? "not-allowed" : "pointer", boxShadow: "0 3px 12px rgba(249,115,22,0.32)", transition: "transform 0.15s,box-shadow 0.15s", "&:hover:not(:disabled)": { transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(249,115,22,0.40)" }, "&:active:not(:disabled)": { transform: "scale(0.97)" } }}
            >
              {submitting ? "Salvando..." : isEditMode ? "Salvar alterações" : "Criar usuário"}
            </Box>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}
