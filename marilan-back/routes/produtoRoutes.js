const express = require('express');
const produtoController = require('../controllers/produtoController');

const router = express.Router();

router.get('/', produtoController.list);
router.post('/', produtoController.create);

module.exports = router;
