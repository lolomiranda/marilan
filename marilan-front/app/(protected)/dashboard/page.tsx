"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@mui/material";

interface ResumoStatus {
  status: string;
  total: number;
}
interface TopMaquina {
  id: number;
  nome: string;
  total_paradas: number;
}
interface TopManutentor {
  id: number;
  nome: string;
  total_reparos: number;
}
interface TopMotivo {
  motivo: string;
  total: number;
}
interface SetorProblema {
  setor: string;
  total_problemas: number;
}
interface DashboardResumo {
  status: ResumoStatus[];
  topMaquinas: TopMaquina[];
  topManutentores: TopManutentor[];
  topMotivos: TopMotivo[];
  setoresProblema: SetorProblema[];
  tempoMedioConsertoMinutos: number;
}

const instabilidadeData = [55, 62, 50, 68, 72, 65, 80];
const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const STATUS_COLORS: Record<string, string> = {
  concluida: "#22c55e",
  "em andamento": "#F97316",
  aguardando: "#facc15",
  critica: "#ef4444",
  cancelada: "#94a3b8",
};

function initials(nome: string) {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function DashboardPage() {
  const router = useRouter();
  const [resumo, setResumo] = useState<DashboardResumo | null>(null);
  const [maquinasCount, setMaquinasCount] = useState(0);
  const [usuariosCount, setUsuariosCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);

  async function loadDashboard() {
    setLoading(true);
    setError(null);
    try {
      const storedUser = localStorage.getItem("marilanUser");
      if (!storedUser) { router.push("/"); return; }
      const user = JSON.parse(storedUser) as { id: number; role: string };
      if (user.role !== "admin") { router.push("/"); return; }
      const headers = { "X-User-Id": String(user.id), "X-User-Role": user.role };
      const [resumoRes, maquinasRes, usuariosRes] = await Promise.all([
        fetch("http://localhost:3001/dashboard/resumo", { headers }),
        fetch("http://localhost:3001/maquinas", { headers }),
        fetch("http://localhost:3001/usuarios", { headers }),
      ]);
      const resumoData = await resumoRes.json();
      const maquinasData = await maquinasRes.json();
      const usuariosData = await usuariosRes.json();
      if (!resumoRes.ok) throw new Error(resumoData.error || "Falha ao carregar resumo");
      if (!maquinasRes.ok) throw new Error(maquinasData.error || "Falha ao carregar máquinas");
      if (!usuariosRes.ok) throw new Error(usuariosData.error || "Falha ao carregar usuários");
      setResumo(resumoData);
      setMaquinasCount(Array.isArray(maquinasData) ? maquinasData.length : 0);
      setUsuariosCount(Array.isArray(usuariosData) ? usuariosData.length : 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("marilanUser");
    if (!storedUser) { router.push("/"); return; }
    const user = JSON.parse(storedUser) as { role: string };
    if (user.role !== "admin") { router.push("/"); return; }
    setAuthorized(true);
    loadDashboard();
  }, [router]);

  const totalOrdens = resumo?.status.reduce((sum, item) => sum + item.total, 0) ?? 0;
  const maxTopMaquinas = Math.max(...(resumo?.topMaquinas.map((i) => i.total_paradas) || [0]), 1);
  const maxTopMotivos = Math.max(...(resumo?.topMotivos.map((i) => i.total) || [0]), 1);
  const maxSetores = Math.max(...(resumo?.setoresProblema.map((i) => i.total_problemas) || [0]), 1);
  const maxInstab = Math.max(...instabilidadeData);

  if (!authorized) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #FBF4EC; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes barGrow {
          from { width: 0%; }
          to   { width: var(--bar-w); }
        }

        .db-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 28px 48px;
          font-family: 'Sora', sans-serif;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .db-page-header {
          animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }

        .db-page-title {
          font-family: 'Fraunces', serif;
          font-size: 32px;
          font-weight: 900;
          color: #1C0A00;
          letter-spacing: -0.6px;
          margin-bottom: 5px;
        }

        .db-page-sub {
          font-size: 13px;
          color: #9A6040;
          font-weight: 400;
        }

        /* KPIs */
        .db-kpis {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.07s both;
        }

        @media (max-width: 900px) { .db-kpis { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .db-kpis { grid-template-columns: 1fr; } }

        .db-kpi {
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(249,115,22,0.12);
          padding: 20px 20px 16px;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .db-kpi:hover { box-shadow: 0 8px 32px rgba(249,115,22,0.12); transform: translateY(-2px); }

        .db-kpi::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #F97316, #EA6C00);
          border-radius: 16px 16px 0 0;
        }

        .db-kpi-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #C4956A;
          margin-bottom: 10px;
        }

        .db-kpi-value {
          font-family: 'Fraunces', serif;
          font-size: 36px;
          font-weight: 900;
          color: #1C0A00;
          letter-spacing: -1.5px;
          line-height: 1;
          margin-bottom: 10px;
        }

        .db-kpi-value small {
          font-size: 16px;
          font-weight: 500;
          color: #9A6040;
          letter-spacing: 0;
        }

        .db-kpi-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-family: 'Sora', sans-serif;
          font-size: 11px;
          font-weight: 600;
          border-radius: 20px;
          padding: 3px 9px;
        }

        .db-kpi-badge.green { color: #15803d; background: #dcfce7; }
        .db-kpi-badge.amber { color: #b45309; background: #fef3c7; }
        .db-kpi-badge.blue  { color: #1d4ed8; background: #dbeafe; }

        .db-kpi-icon {
          position: absolute;
          right: 16px;
          bottom: 14px;
          width: 38px; height: 38px;
          border-radius: 11px;
          background: #FFF3E8;
          display: flex; align-items: center; justify-content: center;
        }
        .db-kpi-icon svg { width: 20px; height: 20px; stroke: #EA6C00; fill: none; stroke-width: 2; }

        /* 2-col grid */
        .db-grid2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.14s both;
        }
        @media (max-width: 768px) { .db-grid2 { grid-template-columns: 1fr; } }

        .db-panel {
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(249,115,22,0.1);
          padding: 20px 22px;
        }

        .db-panel-title {
          font-family: 'Fraunces', serif;
          font-size: 15px;
          font-weight: 700;
          color: #1C0A00;
          letter-spacing: -0.2px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .db-panel-tag {
          font-family: 'Sora', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1px;
          color: #C4956A;
          text-transform: uppercase;
        }

        /* Status rows */
        .db-status-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #FFF0E4;
        }
        .db-status-row:last-child { border-bottom: none; }

        .db-status-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #3D1A00;
          text-transform: capitalize;
        }

        .db-status-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .db-status-chip {
          background: #FFF3E8;
          color: #EA6C00;
          border-radius: 20px;
          padding: 3px 10px;
          font-size: 12px;
          font-weight: 700;
        }

        /* Bar rows */
        .db-bar-row { margin-bottom: 12px; }
        .db-bar-row:last-child { margin-bottom: 0; }

        .db-bar-header {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 6px;
          color: #3D1A00;
          font-weight: 500;
        }
        .db-bar-header span { color: #9A6040; font-weight: 400; }

        .db-bar-track {
          height: 8px;
          background: #FFF0E4;
          border-radius: 20px;
          overflow: hidden;
        }

        .db-bar-fill {
          height: 100%;
          border-radius: 20px;
          animation: barGrow 0.9s cubic-bezier(0.22,1,0.36,1) both;
          width: var(--bar-w);
        }

        /* Manutentores */
        .db-manut-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 0;
          border-bottom: 1px solid #FFF0E4;
        }
        .db-manut-row:last-child { border-bottom: none; }

        .db-manut-rank {
          font-family: 'Fraunces', serif;
          font-size: 18px;
          font-weight: 900;
          color: #F5CBA7;
          width: 24px;
          text-align: center;
          flex-shrink: 0;
        }
        .db-manut-rank.top { color: #EA6C00; }

        .db-manut-avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: #FFF3E8;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #EA6C00;
          flex-shrink: 0;
        }

        .db-manut-info { flex: 1; }
        .db-manut-name { font-size: 13px; font-weight: 600; color: #1C0A00; }
        .db-manut-sub  { font-size: 11px; color: #9A6040; margin-top: 1px; }

        .db-manut-count {
          font-family: 'Fraunces', serif;
          font-size: 22px;
          font-weight: 900;
          color: #EA6C00;
        }

        /* Chart */
        .db-chart-bars {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          height: 110px;
          margin-bottom: 10px;
        }

        .db-chart-bar-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          height: 100%;
          justify-content: flex-end;
        }

        .db-chart-bar {
          width: 100%;
          border-radius: 6px 6px 0 0;
          min-height: 8px;
          transition: opacity 0.2s;
        }
        .db-chart-bar:hover { opacity: 0.8; }
        .db-chart-bar.high { background: linear-gradient(180deg, #F97316 0%, #EA6C00 100%); }
        .db-chart-bar.mid  { background: linear-gradient(180deg, #FDBA74 0%, #FB923C 100%); }

        .db-chart-labels {
          display: flex;
          justify-content: space-between;
        }
        .db-chart-labels span {
          flex: 1;
          text-align: center;
          font-size: 10px;
          color: #C4956A;
          font-weight: 500;
        }

        .db-chart-val {
          font-size: 9px;
          color: #9A6040;
          margin-bottom: 3px;
        }

        /* Setores */
        .db-setor-row { margin-bottom: 10px; }
        .db-setor-row:last-child { margin-bottom: 0; }
      `}</style>

      <main className="db-page">
        <div className="db-page-header">
          <h1 className="db-page-title">Dashboard</h1>
          <p className="db-page-sub">Visão geral do sistema — ordens, máquinas e desempenho operacional</p>
        </div>

        {error && <Alert severity="error" sx={{ fontFamily: "'Sora', sans-serif" }}>{error}</Alert>}

        {/* KPIs */}
        <div className="db-kpis">
          <div className="db-kpi">
            <div className="db-kpi-label">Relatórios de Parada</div>
            <div className="db-kpi-value">{loading ? "—" : totalOrdens}</div>
            <span className="db-kpi-badge green">↑ Total</span>
            <div className="db-kpi-icon">
              <svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </div>
          </div>

          <div className="db-kpi">
            <div className="db-kpi-label">Máquinas</div>
            <div className="db-kpi-value">{loading ? "—" : maquinasCount}</div>
            <span className="db-kpi-badge blue">Ativas</span>
            <div className="db-kpi-icon">
              <svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
            </div>
          </div>

          <div className="db-kpi">
            <div className="db-kpi-label">Usuários</div>
            <div className="db-kpi-value">{loading ? "—" : usuariosCount}</div>
            <span className="db-kpi-badge green">Online</span>
            <div className="db-kpi-icon">
              <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
          </div>

          <div className="db-kpi">
            <div className="db-kpi-label">Tempo Médio Conserto</div>
            <div className="db-kpi-value">
              {loading ? "—" : resumo ? <>{Math.round(resumo.tempoMedioConsertoMinutos)}<small> min</small></> : "—"}
            </div>
            <span className="db-kpi-badge amber">↓ Melhorou</span>
            <div className="db-kpi-icon">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
        </div>

        {/* ROW 1 */}
        <div className="db-grid2">
          {/* Status */}
          <div className="db-panel">
            <div className="db-panel-title">
              Ordens por status
              <span className="db-panel-tag">Hoje</span>
            </div>
            {loading
              ? <p style={{ color: "#9A6040", fontSize: 13 }}>Carregando...</p>
              : resumo?.status.map((item) => {
                  const label = item.status.replace(/_/g, " ");
                  const color = STATUS_COLORS[label] ?? "#F97316";
                  return (
                    <div key={item.status} className="db-status-row">
                      <span className="db-status-name">
                        <span className="db-status-dot" style={{ background: color }} />
                        {label}
                      </span>
                      <span className="db-status-chip">{item.total}</span>
                    </div>
                  );
                })
            }
          </div>

          {/* Top motivos */}
          <div className="db-panel">
            <div className="db-panel-title">
              Top motivos das quebras
              <span className="db-panel-tag">Ranking</span>
            </div>
            {loading
              ? <p style={{ color: "#9A6040", fontSize: 13 }}>Carregando...</p>
              : resumo?.topMotivos.map((item, i) => {
                  const pct = Math.round((item.total / maxTopMotivos) * 100);
                  const stops = [
                    "linear-gradient(90deg,#F97316,#EA6C00)",
                    "linear-gradient(90deg,#FB923C,#F97316)",
                    "linear-gradient(90deg,#FDBA74,#FB923C)",
                    "linear-gradient(90deg,#FED7AA,#FDBA74)",
                    "#FFF0E4",
                  ];
                  return (
                    <div key={item.motivo} className="db-bar-row">
                      <div className="db-bar-header">
                        {item.motivo} <span>{item.total}</span>
                      </div>
                      <div className="db-bar-track">
                        <div
                          className="db-bar-fill"
                          style={{ "--bar-w": `${pct}%`, background: stops[i] ?? stops[4] } as React.CSSProperties}
                        />
                      </div>
                    </div>
                  );
                })
            }
          </div>

          {/* Top máquinas */}
          <div className="db-panel">
            <div className="db-panel-title">
              Máquinas com mais paradas
              <span className="db-panel-tag">Últimos 30 dias</span>
            </div>
            {loading
              ? <p style={{ color: "#9A6040", fontSize: 13 }}>Carregando...</p>
              : resumo?.topMaquinas.map((maquina, i) => {
                  const pct = Math.round((maquina.total_paradas / maxTopMaquinas) * 100);
                  const stops = [
                    "linear-gradient(90deg,#EA6C00,#C55700)",
                    "linear-gradient(90deg,#F97316,#EA6C00)",
                    "linear-gradient(90deg,#FB923C,#F97316)",
                    "linear-gradient(90deg,#FDBA74,#FB923C)",
                    "#FFF0E4",
                  ];
                  return (
                    <div key={maquina.id} className="db-bar-row">
                      <div className="db-bar-header">
                        {maquina.nome} <span>{maquina.total_paradas}</span>
                      </div>
                      <div className="db-bar-track">
                        <div
                          className="db-bar-fill"
                          style={{ "--bar-w": `${pct}%`, background: stops[i] ?? stops[4] } as React.CSSProperties}
                        />
                      </div>
                    </div>
                  );
                })
            }
          </div>

          {/* Top manutentores */}
          <div className="db-panel">
            <div className="db-panel-title">
              Top manutentores
              <span className="db-panel-tag">Reparos</span>
            </div>
            {loading
              ? <p style={{ color: "#9A6040", fontSize: 13 }}>Carregando...</p>
              : resumo?.topManutentores.map((user, i) => (
                  <div key={user.id} className="db-manut-row">
                    <div className={`db-manut-rank${i < 2 ? " top" : ""}`}>{i + 1}</div>
                    <div className="db-manut-avatar">{initials(user.nome)}</div>
                    <div className="db-manut-info">
                      <div className="db-manut-name">{user.nome}</div>
                      <div className="db-manut-sub">Reparos realizados</div>
                    </div>
                    <div className="db-manut-count">{user.total_reparos}</div>
                  </div>
                ))
            }
          </div>
        </div>

        {/* ROW 2: Setores + Instabilidade */}
        <div className="db-grid2" style={{ animationDelay: "0.21s" }}>
          {/* Setores */}
          <div className="db-panel">
            <div className="db-panel-title">
              Setores com mais problemas
              <span className="db-panel-tag">Ranking</span>
            </div>
            {loading
              ? <p style={{ color: "#9A6040", fontSize: 13 }}>Carregando...</p>
              : resumo?.setoresProblema.map((item, i) => {
                  const pct = Math.round((item.total_problemas / maxSetores) * 100);
                  const colors = ["#22c55e", "#16a34a", "#15803d", "#166534", "#14532d"];
                  return (
                    <div key={item.setor} className="db-setor-row">
                      <div className="db-bar-header">
                        {item.setor || "Sem setor"} <span>{item.total_problemas}</span>
                      </div>
                      <div className="db-bar-track">
                        <div
                          className="db-bar-fill"
                          style={{ "--bar-w": `${pct}%`, background: colors[i] ?? colors[4] } as React.CSSProperties}
                        />
                      </div>
                    </div>
                  );
                })
            }
          </div>

          {/* Instabilidade */}
          <div className="db-panel">
            <div className="db-panel-title">
              Instabilidade operacional
              <span className="db-panel-tag">% por dia</span>
            </div>
            <div className="db-chart-bars">
              {instabilidadeData.map((value, index) => {
                const heightPct = Math.round((value / maxInstab) * 100);
                const isHigh = value >= 68;
                return (
                  <div key={index} className="db-chart-bar-wrap">
                    <div className="db-chart-val">{value}%</div>
                    <div
                      className={`db-chart-bar ${isHigh ? "high" : "mid"}`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="db-chart-labels">
              {diasSemana.map((dia) => <span key={dia}>{dia}</span>)}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
