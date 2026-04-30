"use client";

import React, { useEffect, useState } from "react";
import { Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface Maquina {
  id: number;
  nome: string;
  localizacao: string;
  descricao: string;
  horas_funcionamento: number | null;
  created_at: string;
}

export default function MaquinasPage() {
  const [currentUser, setCurrentUser] = useState<{ id: number; role: string } | null>(null);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [descricao, setDescricao] = useState("");
  const [horasFuncionamento, setHorasFuncionamento] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Maquina | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [search, setSearch] = useState("");

  async function fetchMaquinas() {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (currentUser) {
        headers["X-User-Id"] = String(currentUser.id);
        headers["X-User-Role"] = currentUser.role;
      }
      const response = await fetch("http://localhost:3001/maquinas", { headers });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao carregar máquinas");
      setMaquinas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível conectar ao servidor");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem("marilanUser");
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)); }
      catch { localStorage.removeItem("marilanUser"); }
    }
  }, []);

  useEffect(() => { fetchMaquinas(); }, [currentUser]);

  const handleOpen = () => {
    setSelectedMachine(null); setIsEditMode(false);
    setSubmitError(null); setSubmitSuccess(null);
    setNome(""); setLocalizacao(""); setDescricao(""); setHorasFuncionamento("");
    setOpen(true);
  };

  const handleEdit = (machine: Maquina) => {
    setSelectedMachine(machine); setIsEditMode(true);
    setSubmitError(null); setSubmitSuccess(null);
    setNome(machine.nome); setLocalizacao(machine.localizacao);
    setDescricao(machine.descricao || "");
    setHorasFuncionamento(machine.horas_funcionamento ? String(machine.horas_funcionamento) : "");
    setOpen(true);
  };

  const handleDelete = async (machine: Maquina) => {
    if (!currentUser) return;
    if (!window.confirm(`Deseja excluir a máquina ${machine.nome}?`)) return;
    try {
      const response = await fetch(`http://localhost:3001/maquinas/${machine.id}`, {
        method: "DELETE",
        headers: { "X-User-Id": String(currentUser.id), "X-User-Role": currentUser.role },
      });
      if (!response.ok) { const data = await response.json(); setError(data.error || "Falha ao excluir"); return; }
      await fetchMaquinas();
    } catch { setError("Falha ao conectar ao servidor"); }
  };

  const handleClose = () => {
    setOpen(false); setNome(""); setLocalizacao(""); setDescricao("");
    setSelectedMachine(null); setIsEditMode(false);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null); setSubmitSuccess(null); setSubmitting(true);
    if (!currentUser || currentUser.role !== "admin") {
      setSubmitError("Somente admin pode cadastrar ou editar máquinas");
      setSubmitting(false); return;
    }
    const payload = { nome, localizacao, descricao, horas_funcionamento: horasFuncionamento ? parseFloat(horasFuncionamento) : null };
    const isUpdate = isEditMode && selectedMachine !== null;
    const url = isUpdate ? `http://localhost:3001/maquinas/${selectedMachine?.id}` : "http://localhost:3001/maquinas";
    const method = isUpdate ? "PATCH" : "POST";
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "X-User-Id": String(currentUser.id), "X-User-Role": currentUser.role },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) { setSubmitError(data.error || "Falha ao salvar"); setSubmitting(false); return; }
      setSubmitSuccess(isUpdate ? "Máquina atualizada com sucesso" : "Máquina cadastrada com sucesso");
      setNome(""); setLocalizacao(""); setDescricao(""); setSelectedMachine(null); setIsEditMode(false);
      await fetchMaquinas();
      setSubmitting(false);
      setTimeout(() => setOpen(false), 900);
    } catch { setSubmitError("Falha ao conectar ao servidor"); setSubmitting(false); }
  }

  const filtered = maquinas.filter(
    (m) =>
      m.nome.toLowerCase().includes(search.toLowerCase()) ||
      m.localizacao.toLowerCase().includes(search.toLowerCase())
  );

  const maxHoras = Math.max(...maquinas.map((m) => m.horas_funcionamento ?? 0), 1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FBF4EC; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .mq-topbar {
          position: sticky; top: 0; z-index: 100;
          background: linear-gradient(135deg, #1C0A00 0%, #3B1500 100%);
          height: 58px; padding: 0 32px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid rgba(249,115,22,0.18);
          box-shadow: 0 4px 24px rgba(28,10,0,0.25);
        }

        .mq-logo {
          font-family: 'Fraunces', serif;
          font-size: 20px; font-weight: 900; color: #fff;
          letter-spacing: -0.4px; text-decoration: none;
        }
        .mq-logo span { color: #F97316; }

        .mq-nav { display: flex; gap: 2px; }
        .mq-nav a {
          font-family: 'Sora', sans-serif;
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.5);
          padding: 7px 13px; border-radius: 8px;
          text-decoration: none; transition: all 0.2s;
        }
        .mq-nav a:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.07); }
        .mq-nav a.active { color: #fff; background: rgba(249,115,22,0.22); }

        .mq-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, #F97316, #EA6C00);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Sora', sans-serif;
          font-size: 12px; font-weight: 700; color: #fff;
          box-shadow: 0 2px 10px rgba(249,115,22,0.45); cursor: pointer;
        }

        .mq-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 28px 48px;
          font-family: 'Sora', sans-serif;
          display: flex; flex-direction: column; gap: 24px;
        }

        .mq-header-row {
          display: flex; align-items: flex-start;
          justify-content: space-between; flex-wrap: wrap; gap: 16px;
          animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }

        .mq-page-title {
          font-family: 'Fraunces', serif;
          font-size: 32px; font-weight: 900;
          color: #1C0A00; letter-spacing: -0.6px; margin-bottom: 5px;
        }

        .mq-page-sub { font-size: 13px; color: #9A6040; }

        .mq-add-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: linear-gradient(135deg, #F97316, #EA6C00);
          border: none; border-radius: 10px; color: #fff;
          font-family: 'Sora', sans-serif;
          font-size: 13px; font-weight: 600;
          padding: 10px 20px; cursor: pointer;
          box-shadow: 0 4px 16px rgba(249,115,22,0.38);
          transition: transform 0.15s, box-shadow 0.15s; white-space: nowrap;
        }
        .mq-add-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(249,115,22,0.45); }

        .mq-search-row {
          display: flex; gap: 10px; align-items: center;
          animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.07s both;
        }

        .mq-search-wrap { position: relative; flex: 1; }

        .mq-search-ico {
          position: absolute; left: 13px; top: 50%;
          transform: translateY(-50%);
          width: 16px; height: 16px; color: #C4956A; pointer-events: none;
        }

        .mq-search-input {
          width: 100%;
          background: #fff; border: 1.5px solid #F5CBA7;
          border-radius: 10px; padding: 10px 14px 10px 40px;
          font-family: 'Sora', sans-serif; font-size: 13px; color: #1C0A00;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .mq-search-input:focus { border-color: #EA6C00; box-shadow: 0 0 0 3px rgba(249,115,22,0.12); }
        .mq-search-input::placeholder { color: #C4956A; }

        .mq-table-wrap {
          background: #fff; border-radius: 16px;
          border: 1px solid rgba(249,115,22,0.1);
          overflow: hidden;
          animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.13s both;
          box-shadow: 0 4px 24px rgba(249,115,22,0.06);
        }

        .mq-table {
          width: 100%; border-collapse: collapse; font-size: 13px;
        }

        .mq-table thead tr {
          background: #FFF9F5;
          border-bottom: 1px solid #F5E8D8;
        }

        .mq-table th {
          padding: 12px 16px; text-align: left;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.9px; text-transform: uppercase;
          color: #9A6040; white-space: nowrap;
        }

        .mq-table th:last-child { text-align: center; }

        .mq-table td {
          padding: 13px 16px; color: #3D1A00;
          border-bottom: 1px solid #FFF0E4;
          vertical-align: middle;
        }

        .mq-table tr:last-child td { border-bottom: none; }
        .mq-table tbody tr { transition: background 0.15s; }
        .mq-table tbody tr:hover td { background: #FFFAF5; }

        .mq-id { color: #C4956A; font-weight: 600; font-size: 12px; }

        .mq-machine-name { font-weight: 600; color: #1C0A00; }

        .mq-loc-badge {
          display: inline-flex; align-items: center; gap: 4px;
          background: #FFF3E8; color: #EA6C00;
          border-radius: 7px; padding: 3px 9px;
          font-size: 11px; font-weight: 600;
        }

        .mq-hours-wrap { display: flex; align-items: center; gap: 8px; }
        .mq-hours-track {
          width: 56px; height: 5px;
          background: #FFF0E4; border-radius: 20px; overflow: hidden;
        }
        .mq-hours-fill {
          height: 100%; border-radius: 20px;
          background: linear-gradient(90deg, #F97316, #EA6C00);
        }
        .mq-hours-val { font-size: 12px; color: #6B3A1F; font-weight: 500; }

        .mq-date { color: #9A6040; font-size: 12px; }

        .mq-actions { display: flex; gap: 7px; justify-content: center; }

        .mq-btn-edit {
          display: inline-flex; align-items: center; gap: 4px;
          background: #FFF3E8; border: 1px solid #F5CBA7;
          border-radius: 8px; color: #EA6C00;
          font-family: 'Sora', sans-serif;
          font-size: 11px; font-weight: 600;
          padding: 5px 11px; cursor: pointer;
          transition: background 0.15s;
        }
        .mq-btn-edit:hover { background: #FFE8D0; }

        .mq-btn-del {
          display: inline-flex; align-items: center; gap: 4px;
          background: #FEE2E2; border: 1px solid #FECACA;
          border-radius: 8px; color: #dc2626;
          font-family: 'Sora', sans-serif;
          font-size: 11px; font-weight: 600;
          padding: 5px 11px; cursor: pointer;
          transition: background 0.15s;
        }
        .mq-btn-del:hover { background: #FEcaca; }

        .mq-table-footer {
          padding: 14px 18px;
          border-top: 1px solid #FFF0E4;
          display: flex; align-items: center; justify-content: space-between;
          font-size: 12px; color: #9A6040;
        }

        /* MODAL OVERLAY */
        .mq-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(28,10,0,0.5);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          backdrop-filter: blur(4px);
        }

        .mq-modal {
          background: #fff;
          border-radius: 20px;
          border: 1px solid rgba(249,115,22,0.18);
          box-shadow: 0 24px 72px rgba(120,53,15,0.25), 0 4px 20px rgba(249,115,22,0.1);
          width: 100%; max-width: 480px;
          overflow: hidden;
          animation: modalIn 0.35s cubic-bezier(0.22,1,0.36,1) both;
        }

        .mq-modal-header {
          background: linear-gradient(135deg, #1C0A00, #3B1500);
          padding: 20px 24px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid rgba(249,115,22,0.15);
        }

        .mq-modal-title {
          font-family: 'Fraunces', serif;
          font-size: 18px; font-weight: 900;
          color: #fff; letter-spacing: -0.3px;
        }

        .mq-modal-close {
          width: 30px; height: 30px; border-radius: 9px;
          background: rgba(255,255,255,0.1); border: none;
          color: rgba(255,255,255,0.7);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.2s;
        }
        .mq-modal-close:hover { background: rgba(255,255,255,0.2); }

        .mq-modal-body {
          padding: 24px;
          display: flex; flex-direction: column; gap: 16px;
        }

        .mq-modal-field label {
          display: block;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.9px; text-transform: uppercase;
          color: #6B3A1F; margin-bottom: 7px;
        }

        .mq-modal-input {
          width: 100%;
          background: #FFF9F5; border: 1.5px solid #F5CBA7;
          border-radius: 10px; padding: 11px 13px;
          font-family: 'Sora', sans-serif; font-size: 13px;
          color: #1C0A00; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .mq-modal-input:focus {
          border-color: #EA6C00;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.13);
          background: #fff;
        }
        .mq-modal-input::placeholder { color: #C4956A; }

        .mq-modal-textarea { resize: vertical; min-height: 80px; }

        .mq-modal-helper {
          font-size: 10px; color: #C4956A; margin-top: 5px;
        }

        .mq-modal-2col {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
        }

        .mq-modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #FFF0E4;
          display: flex; gap: 10px; justify-content: flex-end;
        }

        .mq-modal-cancel {
          background: transparent; border: 1.5px solid #F5CBA7;
          border-radius: 10px; color: #6B3A1F;
          font-family: 'Sora', sans-serif;
          font-size: 13px; font-weight: 600;
          padding: 10px 20px; cursor: pointer;
          transition: background 0.15s;
        }
        .mq-modal-cancel:hover { background: #FFF9F5; }

        .mq-modal-save {
          background: linear-gradient(135deg, #F97316, #EA6C00);
          border: none; border-radius: 10px; color: #fff;
          font-family: 'Sora', sans-serif;
          font-size: 13px; font-weight: 600;
          padding: 10px 24px; cursor: pointer;
          box-shadow: 0 4px 16px rgba(249,115,22,0.38);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .mq-modal-save:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(249,115,22,0.45); }
        .mq-modal-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .mq-empty {
          text-align: center; padding: 40px 20px;
          color: #9A6040; font-size: 13px;
        }
      `}</style>

      {/* TOPBAR */}
      <header className="mq-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <a href="/dashboard" className="mq-logo">Mari<span>lan</span></a>
          <nav className="mq-nav">
            <a href="/dashboard">Dashboard</a>
            <a href="/maquinas" className="active">Máquinas</a>
            <a href="/ordens-servico">Ordens</a>
            <a href="/register">Usuários</a>
          </nav>
        </div>
        <div className="mq-avatar">AD</div>
      </header>

      <main className="mq-page">
        {/* Header */}
        <div className="mq-header-row">
          <div>
            <h1 className="mq-page-title">Máquinas</h1>
            <p className="mq-page-sub">Gerencie o parque de equipamentos e histórico de funcionamento</p>
          </div>
          {currentUser?.role === "admin" ? (
            <button className="mq-add-btn" onClick={handleOpen}>
              <AddIcon style={{ fontSize: 16 }} />
              Adicionar máquina
            </button>
          ) : (
            <p style={{ color: "#9A6040", fontSize: 12 }}>Apenas administradores podem cadastrar máquinas.</p>
          )}
        </div>

        {error && <Alert severity="error" sx={{ fontFamily: "'Sora', sans-serif" }}>{error}</Alert>}

        {/* Search */}
        <div className="mq-search-row">
          <div className="mq-search-wrap">
            <svg className="mq-search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              className="mq-search-input"
              type="text"
              placeholder="Buscar por nome ou localização..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="mq-table-wrap">
          <table className="mq-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Localização</th>
                <th>Descrição</th>
                <th>Horas (MTBF)</th>
                <th>Cadastro</th>
                {currentUser?.role === "admin" && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="mq-empty">Carregando máquinas...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="mq-empty">Nenhuma máquina encontrada.</td>
                </tr>
              ) : (
                filtered.map((maquina) => {
                  const hPct = maquina.horas_funcionamento
                    ? Math.round((maquina.horas_funcionamento / maxHoras) * 100)
                    : 0;
                  return (
                    <tr key={maquina.id}>
                      <td><span className="mq-id">#{String(maquina.id).padStart(3, "0")}</span></td>
                      <td><span className="mq-machine-name">{maquina.nome}</span></td>
                      <td><span className="mq-loc-badge">📍 {maquina.localizacao}</span></td>
                      <td style={{ color: "#9A6040", fontSize: 12 }}>{maquina.descricao || "—"}</td>
                      <td>
                        {maquina.horas_funcionamento != null ? (
                          <div className="mq-hours-wrap">
                            <div className="mq-hours-track">
                              <div className="mq-hours-fill" style={{ width: `${hPct}%` }} />
                            </div>
                            <span className="mq-hours-val">{maquina.horas_funcionamento}h</span>
                          </div>
                        ) : "—"}
                      </td>
                      <td><span className="mq-date">{new Date(maquina.created_at).toLocaleDateString("pt-BR")}</span></td>
                      {currentUser?.role === "admin" && (
                        <td>
                          <div className="mq-actions">
                            <button className="mq-btn-edit" onClick={() => handleEdit(maquina)}>
                              <EditIcon style={{ fontSize: 13 }} /> Editar
                            </button>
                            <button className="mq-btn-del" onClick={() => handleDelete(maquina)}>
                              <DeleteIcon style={{ fontSize: 13 }} /> Excluir
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className="mq-table-footer">
            <span>Mostrando {filtered.length} de {maquinas.length} máquinas</span>
          </div>
        </div>
      </main>

      {/* MODAL */}
      {open && (
        <div className="mq-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
          <div className="mq-modal">
            <div className="mq-modal-header">
              <span className="mq-modal-title">
                {isEditMode ? "Editar máquina" : "Cadastrar máquina"}
              </span>
              <button className="mq-modal-close" onClick={handleClose}>
                <CloseIcon style={{ fontSize: 16 }} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mq-modal-body">
                {submitError && <Alert severity="error" sx={{ fontFamily: "'Sora', sans-serif", fontSize: 13 }}>{submitError}</Alert>}
                {submitSuccess && <Alert severity="success" sx={{ fontFamily: "'Sora', sans-serif", fontSize: 13 }}>{submitSuccess}</Alert>}

                <div className="mq-modal-field">
                  <label>Nome *</label>
                  <input
                    className="mq-modal-input"
                    type="text"
                    placeholder="Ex: Linha de Embalagem D2"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>

                <div className="mq-modal-2col">
                  <div className="mq-modal-field">
                    <label>Localização *</label>
                    <input
                      className="mq-modal-input"
                      type="text"
                      placeholder="Ex: Setor A"
                      value={localizacao}
                      onChange={(e) => setLocalizacao(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mq-modal-field">
                    <label>Horas Funcionamento</label>
                    <input
                      className="mq-modal-input"
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={horasFuncionamento}
                      onChange={(e) => setHorasFuncionamento(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mq-modal-field">
                  <label>Descrição</label>
                  <textarea
                    className="mq-modal-input mq-modal-textarea"
                    placeholder="Descreva a função desta máquina..."
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                  />
                  <p className="mq-modal-helper">Horas totais de funcionamento usadas para cálculo de MTBF</p>
                </div>
              </div>

              <div className="mq-modal-footer">
                <button type="button" className="mq-modal-cancel" onClick={handleClose}>Cancelar</button>
                <button type="submit" className="mq-modal-save" disabled={submitting}>
                  {submitting
                    ? isEditMode ? "Atualizando..." : "Salvando..."
                    : isEditMode ? "Atualizar máquina" : "Salvar máquina"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
