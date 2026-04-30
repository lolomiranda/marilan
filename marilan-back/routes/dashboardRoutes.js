const express = require('express');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.get('/resumo', dashboardController.resumo);
router.get('/pcm/relatorio', dashboardController.pcmRelatorio);
router.get('/pcm/metricas', dashboardController.pcmMetricas);
router.get('/planilha', dashboardController.planilha);

module.exports = router;
