"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  CssBaseline,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import BarChartIcon from "@mui/icons-material/BarChart";
import StorageIcon from "@mui/icons-material/Storage";

interface UserData {
  id: number;
  nome: string;
  cracha: string;
  role: string;
  ativo: boolean;
}

const drawerWidth = 260;

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("marilanUser");
    if (!stored) {
      router.push("/");
      return;
    }

    try {
      setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem("marilanUser");
      router.push("/");
    }
  }, [router]);

  if (!user) {
    return null;
  }

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon />, roles: ["admin"] },
    { label: "Planilhas", href: "/planilhas", icon: <StorageIcon />, roles: ["admin"] },
    { label: "PCM", href: "/pcm", icon: <BarChartIcon />, roles: ["admin", "pcm"] },
    { label: "Ordens de Serviço", href: "/ordens-servico", icon: <AssignmentIcon />, roles: ["admin", "operador", "manutentor"] },
    { label: "Máquinas", href: "/maquinas", icon: <DashboardIcon />, roles: ["admin", "operador", "manutentor"] },
    { label: "Usuários", href: "/usuarios", icon: <PeopleIcon />, roles: ["admin"] },
  ];

  const handleLogout = () => {
    localStorage.removeItem("marilanUser");
    router.push("/");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />

      <Drawer
        variant="permanent"
        open
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid rgba(0,0,0,0.12)",
          },
        }}
      >
        <Toolbar sx={{ px: 3, py: 2 }}>
          <Typography variant="h6" noWrap>
            Marilan
          </Typography>
        </Toolbar>
        <Box sx={{ px: 1, display: "flex", flexDirection: "column", height: "100%" }}>
          <List sx={{ flexGrow: 1 }}>
            {menuItems
              .filter((item) => item.roles.includes(user.role))
              .map((item) => (
                <ListItemButton key={item.label} component="a" href={item.href}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ))}
          </List>
          <Box sx={{ p: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 4, bgcolor: "background.default" }}>
        <Toolbar />
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Bem-vindo, {user.nome}!
        </Typography>
        {children}
      </Box>
    </Box>
  );
}
