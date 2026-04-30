const express = require('express');
const ordemServicoController = require('../controllers/ordemServicoController');

const router = express.Router();

router.get('/', ordemServicoController.list);
router.get('/:id', ordemServicoController.getById);
router.post('/', ordemServicoController.create);
router.patch('/:id/atribuir', ordemServicoController.assign);
router.patch('/:id/iniciar', ordemServicoController.start);
router.patch('/:id/concluir', ordemServicoController.conclude);

module.exports = router;
