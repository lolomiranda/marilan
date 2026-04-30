const express = require('express');
const maquinaController = require('../controllers/maquinaController');

const router = express.Router();

router.get('/', maquinaController.list);
router.post('/', maquinaController.create);
router.patch('/:id', maquinaController.update);
router.delete('/:id', maquinaController.delete);

module.exports = router;
