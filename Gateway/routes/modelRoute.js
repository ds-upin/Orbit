const express = require('express');
const { getModel, getModels, addModel } = require('../controllers/busServiceControllers/modelController');

router = express.Router();

router.get('/list/:skip/:limit',getModels);
router.get('/:id',getModel);
router.post('/',addModel);

module.exports = router;