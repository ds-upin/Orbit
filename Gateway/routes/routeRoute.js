const { getRoute, addRoute } = require('../controllers/busServiceControllers/routeController');

const express = require('express');

const router = express.Router();

router.get('/:id',getRoute);
router.post('/',addRoute);

module.exports = router;