"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@mui/material";

interface UserData {
  id: number;
  nome: string;
  cracha: string;
  role: string;
  ativo: boolean;
}

const roleLabel: Record<string, string> = {
  admin: "Administrador",
  operador: "Operador",
  manutentor: "Manutentor",
  pcm: "PCM",
};

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  const [nome, setNome] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("marilanUser");
    if (!stored) { router.push("/"); return; }
    try {
      const parsed: UserData = JSON.parse(stored);
      setUser(parsed);
      setNome(parsed.nome);
    } catch {
      localStorage.removeItem("marilanUser");
      router.push("/");
    }
  }, [router]);

  if (!user) return null;

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (novaSenha && novaSenha !== confirmarSenha) {
      setError("A nova senha e a confirmação não coincidem.");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, string> = { nome };
      if (novaSenha) {
        payload.senha_atual = senhaAtual;
        payload.nova_senha = novaSenha;
      }

      const res = await fetch(`http://localhost:3001/usuarios/${user!.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": String(user!.id),
          "X-User-Role": user!.role,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erro ao salvar alterações."); return; }

      // Update localStorage with new name
      const updated = { ...user!, nome };
      localStorage.setItem("marilanUser", JSON.stringify(updated));
      setUser(updated);
      setSenhaAtual(""); setNovaSenha(""); setConfirmarSenha("");
      setSuccess("Perfil atualizado com sucesso!");
    } catch {
      setError("Falha ao conectar ao servidor.");
    } finally {
      setSaving(false);
    }
  }

  function initials(n: string) {
    return n.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  }

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

        .pf-page {
          max-width: 560px;
          margin: 0 auto;
          padding: 40px 24px 64px;
          font-family: 'Sora', sans-serif;
          display: flex;
          flex-direction: column;
          gap: 24px;
          animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }

        .pf-header { display: flex; align-items: center; gap: 16px; }

        .pf-avatar {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #F97316, #EA6C00);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Sora', sans-serif;
          font-size: 18px; font-weight: 700; color: #fff;
          box-shadow: 0 4px 16px rgba(249,115,22,0.4);
          flex-shrink: 0;
        }

        .pf-title {
          font-family: 'Fraunces', serif;
          font-size: 26px; font-weight: 900;
          color: #1C0A00; letter-spacing: -0.4px;
        }

        .pf-role {
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #EA6C00; margin-top: 2px;
        }

        .pf-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid rgba(249,115,22,0.12);
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(249,115,22,0.07);
        }

        .pf-card-header {
          padding: 16px 22px 14px;
          border-bottom: 1px solid #FFF0E4;
        }

        .pf-card-title {
          font-family: 'Fraunces', serif;
          font-size: 14px; font-weight: 700;
          color: #1C0A00; letter-spacing: -0.1px;
        }

        .pf-card-body {
          padding: 20px 22px;
          display: flex; flex-direction: column; gap: 16px;
        }

        .pf-field label {
          display: block;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #6B3A1F; margin-bottom: 7px;
        }

        .pf-input {
          width: 100%;
          background: #FFF9F5; border: 1.5px solid #F5CBA7;
          border-radius: 10px; padding: 11px 13px;
          font-family: 'Sora', sans-serif; font-size: 13px;
          color: #1C0A00; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .pf-input:focus { border-color: #EA6C00; box-shadow: 0 0 0 3px rgba(249,115,22,0.13); background: #fff; }
        .pf-input::placeholder { color: #C4956A; }
        .pf-input:disabled { opacity: 0.55; cursor: not-allowed; }

        .pf-info-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #FFF0E4;
          font-size: 13px;
        }
        .pf-info-row:last-child { border-bottom: none; padding-bottom: 0; }
        .pf-info-label { color: #9A6040; font-size: 12px; }
        .pf-info-value { font-weight: 600; color: #1C0A00; }

        .pf-role-badge {
          display: inline-block;
          background: #FFF3E8; color: #EA6C00;
          border-radius: 20px; padding: 3px 10px;
          font-size: 11px; font-weight: 700;
        }

        .pf-footer {
          display: flex; gap: 10px; justify-content: flex-end;
          padding: 16px 22px;
          border-top: 1px solid #FFF0E4;
        }

        .pf-btn-cancel {
          background: transparent; border: 1.5px solid #F5CBA7;
          border-radius: 10px; color: #6B3A1F;
          font-family: 'Sora', sans-serif;
          font-size: 13px; font-weight: 600;
          padding: 10px 20px; cursor: pointer;
          transition: background 0.15s;
        }
        .pf-btn-cancel:hover { background: #FFF9F5; }

        .pf-btn-save {
          background: linear-gradient(135deg, #F97316, #EA6C00);
          border: none; border-radius: 10px; color: #fff;
          font-family: 'Sora', sans-serif;
          font-size: 13px; font-weight: 600;
          padding: 10px 24px; cursor: pointer;
          box-shadow: 0 4px 16px rgba(249,115,22,0.35);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .pf-btn-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(249,115,22,0.45); }
        .pf-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <main className="pf-page">
        {/* Header */}
        <div className="pf-header">
          <div className="pf-avatar">{initials(user.nome)}</div>
          <div>
            <h1 className="pf-title">{user.nome}</h1>
            <p className="pf-role">{roleLabel[user.role] ?? user.role}</p>
          </div>
        </div>

        {success && (
          <Alert severity="success" sx={{ borderRadius: "10px", fontFamily: "'Sora', sans-serif", fontSize: 13 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ borderRadius: "10px", fontFamily: "'Sora', sans-serif", fontSize: 13 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Dados da conta */}
          <div className="pf-card" style={{ marginBottom: 16 }}>
            <div className="pf-card-header">
              <span className="pf-card-title">Dados da conta</span>
            </div>
            <div className="pf-card-body">
              <div className="pf-field">
                <label>Nome</label>
                <input
                  className="pf-input"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="pf-card-body" style={{ paddingTop: 0 }}>
              <div className="pf-info-row">
                <span className="pf-info-label">Crachá</span>
                <span className="pf-info-value">{user.cracha}</span>
              </div>
              <div className="pf-info-row">
                <span className="pf-info-label">Perfil de acesso</span>
                <span className="pf-role-badge">{roleLabel[user.role] ?? user.role}</span>
              </div>
            </div>
          </div>

          {/* Alterar senha */}
          <div className="pf-card">
            <div className="pf-card-header">
              <span className="pf-card-title">Alterar senha</span>
            </div>
            <div className="pf-card-body">
              <div className="pf-field">
                <label>Senha atual</label>
                <input
                  className="pf-input"
                  type="password"
                  placeholder="Digite sua senha atual"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div className="pf-field">
                <label>Nova senha</label>
                <input
                  className="pf-input"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="pf-field">
                <label>Confirmar nova senha</label>
                <input
                  className="pf-input"
                  type="password"
                  placeholder="Repita a nova senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="pf-footer">
              <button
                type="button"
                className="pf-btn-cancel"
                onClick={() => router.back()}
              >
                Cancelar
              </button>
              <button type="submit" className="pf-btn-save" disabled={saving}>
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
