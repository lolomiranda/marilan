"use client";

import { useEffect, useState } from "react";
import { Alert } from "@mui/material";

interface PlanilhaRow {
  nro_relatorio: number;
  data: string;
  linha: string;
  cod: string;
  nome_equipamento: string;
  descricao: string;
  inicio_ocorrencia: string;
  fim_ocorrencia: string;
  manutentor_1: string | null;
  manutentor_2: string | null;
  manutentor_3: string | null;
  duracao_horas: number;
  duracao_minutos: number;
  hora_abertura: string;
  oficina: string;
  localizacao: string;
}

export default function PlanilhasPage() {
  const [planilha, setPlanilha] = useState<PlanilhaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function fetchPlanilha() {
    setLoading(true);
    setError(null);
    try {
      const storedUser = localStorage.getItem("marilanUser");
      if (!storedUser) { setError("Usuário não autenticado"); setLoading(false); return; }
      const user = JSON.parse(storedUser);
      if (user.role !== "admin") { setError("Acesso negado. Apenas administradores podem visualizar planilhas."); setLoading(false); return; }
      const res = await fetch("http://localhost:3001/dashboard/planilha", {
        headers: { "X-User-Id": String(user.id), "X-User-Role": user.role },
      });
      if (!res.ok) throw new Error("Erro ao carregar planilha");
      setPlanilha(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchPlanilha(); }, []);

  const filtered = planilha.filter((row) =>
    Object.values(row).some((v) =>
      String(v ?? "").toLowerCase().includes(search.toLowerCase())
    )
  );

  function exportCSV() {
    const headers = [
      "Nº Relatório","Data","Linha","CÓD.","Nome Equipamento","Descrição",
      "Início Ocorrência","Fim Ocorrência","Manutentor 1","Manutentor 2","Manutentor 3",
      "Hora Abertura","D. OCORR (h)","D. OCORR (min)","Oficina","Localização",
    ];
    const rows = filtered.map((r) => [
      r.nro_relatorio, r.data, r.linha || "-", r.cod, r.nome_equipamento, r.descricao,
      r.inicio_ocorrencia, r.fim_ocorrencia, r.manutentor_1 || "-", r.manutentor_2 || "-",
      r.manutentor_3 || "-", r.hora_abertura, r.duracao_horas, r.duracao_minutos,
      r.oficina, r.localizacao,
    ].join(";"));
    const blob = new Blob([[headers.join(";"), ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `planilha_manutencao_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

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

        .pl-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 32px 28px 56px;
          font-family: 'Sora', sans-serif;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        /* ── Header ── */
        .pl-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }

        .pl-title {
          font-family: 'Fraunces', serif;
          font-size: 32px;
          font-weight: 900;
          color: #1C0A00;
          letter-spacing: -0.6px;
          margin-bottom: 4px;
        }

        .pl-subtitle {
          font-size: 13px;
          color: #9A6040;
        }

        .pl-export-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: linear-gradient(135deg, #F97316, #EA6C00);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 600;
          padding: 10px 20px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(249,115,22,0.38);
          transition: transform 0.15s, box-shadow 0.15s;
          white-space: nowrap;
        }
        .pl-export-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(249,115,22,0.45); }

        /* ── Controls ── */
        .pl-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.07s both;
        }

        .pl-search-wrap {
          position: relative;
          width: 280px;
        }

        .pl-search-ico {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #C4956A;
          pointer-events: none;
          width: 15px;
          height: 15px;
        }

        .pl-search-input {
          width: 100%;
          background: #fff;
          border: 1.5px solid #F5CBA7;
          border-radius: 10px;
          padding: 9px 13px 9px 36px;
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          color: #1C0A00;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .pl-search-input:focus { border-color: #EA6C00; box-shadow: 0 0 0 3px rgba(249,115,22,0.12); }
        .pl-search-input::placeholder { color: #C4956A; }

        .pl-count {
          font-size: 12px;
          color: #9A6040;
        }

        /* ── Table ── */
        .pl-table-wrap {
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(249,115,22,0.1);
          overflow: auto;
          box-shadow: 0 4px 24px rgba(249,115,22,0.07);
          animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.13s both;
          max-height: calc(100vh - 260px);
        }

        .pl-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11.5px;
          table-layout: fixed;
        }

        .pl-table thead {
          position: sticky;
          top: 0;
          z-index: 2;
        }

        .pl-table thead tr {
          background: #FFF9F5;
          border-bottom: 1px solid #F5E8D8;
        }

        .pl-table th {
          padding: 10px 10px;
          text-align: left;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #9A6040;
          white-space: nowrap;
          overflow: hidden;
        }

        .pl-table th.num { text-align: right; }

        .pl-table td {
          padding: 9px 10px;
          color: #3D1A00;
          border-bottom: 1px solid #FFF0E4;
          vertical-align: top;
          overflow: hidden;
        }

        .pl-table tr:last-child td { border-bottom: none; }
        .pl-table tbody tr { transition: background 0.12s; }
        .pl-table tbody tr:hover td { background: #FFFAF5; }

        .pl-table td.num { text-align: right; font-variant-numeric: tabular-nums; }

        .pl-nro {
          font-family: 'Fraunces', serif;
          font-size: 13px;
          font-weight: 700;
          color: #EA6C00;
        }

        .pl-equip { font-weight: 600; color: #1C0A00; }

        .pl-cod {
          display: inline-block;
          background: #FFF3E8;
          color: #EA6C00;
          border-radius: 6px;
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 600;
        }

        .pl-desc {
          color: #6B3A1F;
          line-height: 1.4;
          word-break: break-word;
        }

        .pl-manut-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .pl-manut {
          color: #3D1A00;
          font-size: 11px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pl-manut-empty { color: #D1B08A; }

        .pl-dur {
          font-variant-numeric: tabular-nums;
          font-weight: 600;
          color: #1C0A00;
        }

        .pl-oficina {
          display: inline-block;
          background: #F0FDF4;
          color: #15803d;
          border-radius: 6px;
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 600;
        }

        .pl-loc {
          color: #9A6040;
          font-size: 12px;
        }

        /* ── Loading / empty ── */
        .pl-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 12px;
          color: #9A6040;
          font-size: 13px;
        }

        .pl-spinner {
          width: 32px; height: 32px;
          border: 3px solid #F5CBA7;
          border-top-color: #EA6C00;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .pl-table-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 12px 18px;
          border-top: 1px solid #FFF0E4;
          font-size: 12px;
          color: #9A6040;
        }
      `}</style>

      <main className="pl-page">
        {/* Header */}
        <div className="pl-header">
          <div>
            <h1 className="pl-title">Planilhas de Manutenção</h1>
            <p className="pl-subtitle">Relatório completo de relatórios de parada concluídos</p>
          </div>
          <button className="pl-export-btn" onClick={exportCSV} disabled={filtered.length === 0}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exportar CSV
          </button>
        </div>

        {error && (
          <Alert severity="error" sx={{ borderRadius: "10px", fontFamily: "'Sora', sans-serif", fontSize: 13 }}>
            {error}
          </Alert>
        )}

        {/* Controls */}
        <div className="pl-controls">
          <div className="pl-search-wrap">
            <svg className="pl-search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="pl-search-input"
              type="text"
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="pl-count">
            {loading ? "Carregando..." : `${filtered.length} de ${planilha.length} registros`}
          </span>
        </div>

        {/* Table */}
        <div className="pl-table-wrap">
          {loading ? (
            <div className="pl-center">
              <div className="pl-spinner" />
              Carregando planilha...
            </div>
          ) : (
            <>
              <table className="pl-table">
                <colgroup>
                  <col style={{ width: "5%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "7%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Nº</th>
                    <th>Data</th>
                    <th>Linha / Cód.</th>
                    <th>Equipamento</th>
                    <th>Descrição</th>
                    <th>Início</th>
                    <th>Fim</th>
                    <th>Manutentores</th>
                    <th>Hora</th>
                    <th className="num">Duração</th>
                    <th>Oficina</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={11}>
                        <div className="pl-center">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C4956A" strokeWidth="1.5">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10 9 9 9 8 9"/>
                          </svg>
                          {search ? "Nenhum resultado para a pesquisa." : "Nenhum relatório de parada concluído."}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row) => {
                      const manutentores = [row.manutentor_1, row.manutentor_2, row.manutentor_3].filter(Boolean);
                      return (
                        <tr key={row.nro_relatorio}>
                          <td><span className="pl-nro">#{row.nro_relatorio}</span></td>
                          <td>{row.data}</td>
                          <td>
                            {row.linha && <div style={{ color: "#9A6040", fontSize: 10, marginBottom: 2 }}>{row.linha}</div>}
                            <span className="pl-cod">{row.cod}</span>
                          </td>
                          <td><span className="pl-equip">{row.nome_equipamento}</span></td>
                          <td><span className="pl-desc">{row.descricao}</span></td>
                          <td style={{ fontSize: 11 }}>{row.inicio_ocorrencia}</td>
                          <td style={{ fontSize: 11 }}>{row.fim_ocorrencia}</td>
                          <td>
                            {manutentores.length === 0
                              ? <span className="pl-manut-empty">—</span>
                              : <div className="pl-manut-list">{manutentores.map((m, i) => <span key={i} className="pl-manut">{m}</span>)}</div>
                            }
                          </td>
                          <td style={{ fontSize: 11 }}>{row.hora_abertura}</td>
                          <td className="num">
                            <span className="pl-dur">{row.duracao_horas}h</span>
                            <span style={{ color: "#9A6040", fontSize: 10 }}> {row.duracao_minutos}min</span>
                          </td>
                          <td><span className="pl-oficina">{row.oficina}</span></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              {filtered.length > 0 && (
                <div className="pl-table-footer">
                  Total: <strong style={{ marginLeft: 4, color: "#EA6C00" }}>{filtered.length}</strong>&nbsp;registros
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
