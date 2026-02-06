const express = require('express');
const { getModel, getModels, addModel } = require('../controllers/busServiceControllers/modelController');
const { authenticateAdmin } = require('../middleware/authenticateAdmin');

router = express.Router();

router.get('/list/:skip/:limit', authenticateAdmin, getModels);
router.get('/:id', authenticateAdmin, getModel);
router.post('/', authenticateAdmin, addModel);

module.exports = router;