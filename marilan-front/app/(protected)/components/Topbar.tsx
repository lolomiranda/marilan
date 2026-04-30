"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface UserData {
  id: number;
  nome: string;
  role: string;
}

function initials(nome: string) {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const navItems = [
  { label: "Dashboard",  href: "/dashboard",      roles: ["admin"] },
  { label: "Máquinas",   href: "/maquinas",        roles: ["admin", "operador", "manutentor"] },
  { label: "Relatórios", href: "/ordens-servico",  roles: ["admin", "operador", "manutentor"] },
  { label: "Planilhas",  href: "/planilhas",       roles: ["admin"] },
  { label: "PCM",        href: "/pcm",             roles: ["admin", "pcm"] },
  { label: "Usuários",   href: "/usuarios",        roles: ["admin"] },
];

export default function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("marilanUser");
    if (stored) {
      try { setUser(JSON.parse(stored)); }
      catch { /* ignore */ }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("marilanUser");
    router.push("/");
  };

  if (!user) return null;

  const visibleNav = navItems.filter((item) => item.roles.includes(user.role));

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900&display=swap');

        .tb-bar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: linear-gradient(135deg, #1C0A00 0%, #3B1500 100%);
          height: 58px;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(249,115,22,0.18);
          box-shadow: 0 4px 24px rgba(28,10,0,0.25);
        }

        .tb-left {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .tb-logo {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.4px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .tb-logo span { color: #F97316; }

        .tb-nav { display: flex; gap: 2px; }

        .tb-nav a {
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
          padding: 7px 13px;
          border-radius: 8px;
          text-decoration: none;
          transition: color 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .tb-nav a:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.07); }
        .tb-nav a.tb-active { color: #fff; background: rgba(249,115,22,0.22); }

        .tb-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Avatar + dropdown wrapper */
        .tb-user-wrap {
          position: relative;
          flex-shrink: 0;
        }

        .tb-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #F97316, #EA6C00);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Sora', sans-serif;
          font-size: 12px; font-weight: 700; color: #fff;
          box-shadow: 0 2px 10px rgba(249,115,22,0.45);
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .tb-avatar:hover { transform: scale(1.06); box-shadow: 0 4px 16px rgba(249,115,22,0.6); }
        .tb-avatar.tb-avatar-open { border-color: rgba(249,115,22,0.7); }

        /* Dropdown */
        @keyframes tb-drop-in {
          from { opacity: 0; transform: translateY(6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .tb-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          min-width: 190px;
          background: #fff;
          border-radius: 14px;
          border: 1px solid rgba(249,115,22,0.15);
          box-shadow: 0 16px 48px rgba(28,10,0,0.22), 0 2px 8px rgba(249,115,22,0.1);
          overflow: hidden;
          animation: tb-drop-in 0.2s cubic-bezier(0.22,1,0.36,1) both;
          z-index: 200;
        }

        .tb-dropdown-header {
          padding: 12px 16px 10px;
          border-bottom: 1px solid #FFF0E4;
        }

        .tb-dropdown-name {
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #1C0A00;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tb-dropdown-role {
          font-family: 'Sora', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #EA6C00;
          margin-top: 2px;
        }

        .tb-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 11px 16px;
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #3D1A00;
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          text-align: left;
        }
        .tb-dropdown-item:hover { background: #FFF9F5; color: #EA6C00; }
        .tb-dropdown-item svg { flex-shrink: 0; opacity: 0.6; }
        .tb-dropdown-item:hover svg { opacity: 1; }

        .tb-dropdown-divider {
          height: 1px;
          background: #FFF0E4;
          margin: 0;
        }

        .tb-dropdown-item.tb-logout { color: #dc2626; }
        .tb-dropdown-item.tb-logout:hover { background: #FEF2F2; color: #dc2626; }
      `}</style>

      <header className="tb-bar">
        <div className="tb-left">
          <a href="/dashboard" className="tb-logo">Mari<span>lan</span></a>
          <nav className="tb-nav">
            {visibleNav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={isActive(item.href) ? "tb-active" : ""}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="tb-right">
          <div className="tb-user-wrap" ref={menuRef}>
            <button
              className={`tb-avatar${menuOpen ? " tb-avatar-open" : ""}`}
              onClick={() => setMenuOpen((v) => !v)}
              title={user.nome}
            >
              {initials(user.nome)}
            </button>

            {menuOpen && (
              <div className="tb-dropdown">
                {/* User info */}
                <div className="tb-dropdown-header">
                  <div className="tb-dropdown-name">{user.nome}</div>
                  <div className="tb-dropdown-role">{user.role}</div>
                </div>

                {/* Editar perfil */}
                <a
                  href="/perfil"
                  className="tb-dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Editar perfil
                </a>

                <div className="tb-dropdown-divider" />

                {/* Logout */}
                <button className="tb-dropdown-item tb-logout" onClick={handleLogout}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
