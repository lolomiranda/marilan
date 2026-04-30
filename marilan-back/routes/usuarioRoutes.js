const express = require('express');
const usuarioController = require('../controllers/usuarioController');

const router = express.Router();

router.get('/', usuarioController.list);
router.post('/', usuarioController.register);
router.patch('/:id', usuarioController.update);
router.delete('/:id', usuarioController.delete);

module.exports = router;
