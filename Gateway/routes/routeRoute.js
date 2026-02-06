const { getRoute, addRoute } = require('../controllers/busServiceControllers/routeController');
const { authenticateAdmin } = require('../middleware/authenticateAdmin');

const express = require('express');

const router = express.Router();

router.get('/:route_id', getRoute);
router.post('/', authenticateAdmin, addRoute);

module.exports = router;