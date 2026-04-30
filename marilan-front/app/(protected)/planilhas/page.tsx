"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  TextField,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  async function fetchPlanilha() {
    setLoading(true);
    setError(null);
    try {
      const storedUser = localStorage.getItem("marilanUser");
      if (!storedUser) {
        setError("Usuário não autenticado");
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);
      setCurrentUser(user);

      if (user.role !== "admin") {
        setError("Acesso negado. Apenas administradores podem visualizar planilhas.");
        setLoading(false);
        return;
      }

      const authHeaders = {
        "X-User-Id": String(user.id),
        "X-User-Role": user.role,
      };

      const response = await fetch("http://localhost:3001/dashboard/planilha", {
        headers: authHeaders,
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar planilha");
      }

      const data = await response.json();
      setPlanilha(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlanilha();
  }, []);

  const filteredPlanilha = planilha.filter((row) =>
    Object.values(row).some((value) =>
      String(value || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const exportToCSV = () => {
    const headers = [
      "Nº Relatório",
      "Data",
      "Linha",
      "CÓD.",
      "Nome Equipamento",
      "DESCRIÇÃO",
      "Início da Ocorrência",
      "Fim da Ocorrência",
      "Manutentor 1",
      "Manutentor 2",
      "Manutentor 3",
      "Hora",
      "D. OCORR (horas)",
      "D. OCORR (min)",
      "OFICINA",
      "Localização",
    ];

    const csvContent = [
      headers.join(";"),
      ...filteredPlanilha.map((row) =>
        [
          row.nro_relatorio,
          row.data,
          row.linha || "-",
          row.cod,
          row.nome_equipamento,
          row.descricao,
          row.inicio_ocorrencia,
          row.fim_ocorrencia,
          row.manutentor_1 || "-",
          row.manutentor_2 || "-",
          row.manutentor_3 || "-",
          row.hora_abertura,
          row.duracao_horas,
          row.duracao_minutos,
          row.oficina,
          row.localizacao,
        ].join(";")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `planilha_manutencao_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 10, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 10 }}>
      <Stack spacing={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4">Planilhas de Manutenção</Typography>
            <Typography color="text.secondary">Relatório completo de ordens de serviço concluídas</Typography>
          </Box>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={exportToCSV}>
            Exportar CSV
          </Button>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          placeholder="Pesquisar..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          sx={{ maxWidth: "300px" }}
        />

        <Paper sx={{ overflow: "auto" }}>
          <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>Nº RELAT</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>Data</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>Linha</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>CÓD.</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>Nome Equipamento</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>DESCRIÇÃO</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>Início Ocorrência</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>Fim Ocorrência</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>Manuten 1</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>Manuten 2</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>Manuten 3</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>Hora</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }} align="right">
                    D. OCORR (h)
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }} align="right">
                    D. OCORR (min)
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>OFICINA</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>Localização</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPlanilha.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={16} align="center">
                      {searchTerm ? "Nenhum resultado encontrado" : "Nenhuma ordem concluída"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlanilha.map((row, idx) => (
                    <TableRow key={row.nro_relatorio} sx={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9f9f9" }}>
                      <TableCell>#{row.nro_relatorio}</TableCell>
                      <TableCell>{row.data}</TableCell>
                      <TableCell>{row.linha || "-"}</TableCell>
                      <TableCell>{row.cod}</TableCell>
                      <TableCell>{row.nome_equipamento}</TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {row.descricao}
                      </TableCell>
                      <TableCell>{row.inicio_ocorrencia}</TableCell>
                      <TableCell>{row.fim_ocorrencia}</TableCell>
                      <TableCell>{row.manutentor_1 || "-"}</TableCell>
                      <TableCell>{row.manutentor_2 || "-"}</TableCell>
                      <TableCell>{row.manutentor_3 || "-"}</TableCell>
                      <TableCell>{row.hora_abertura}</TableCell>
                      <TableCell align="right">{row.duracao_horas}</TableCell>
                      <TableCell align="right">{row.duracao_minutos}</TableCell>
                      <TableCell>{row.oficina}</TableCell>
                      <TableCell>{row.localizacao}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Typography variant="body2" color="text.secondary">
          Total de registros: {filteredPlanilha.length}
        </Typography>
      </Stack>
    </Container>
  );
}
