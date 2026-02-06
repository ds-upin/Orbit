const express = require('express');
const { getBus, getBuses, addBus, updateBus, deleteBus } = require('../controllers/busServiceControllers/busController');
const { authenticateAdmin } = require('../middleware/authenticateAdmin');

const router = express.Router();

router.get('/list', getBuses);
router.get('/', getBus);
router.post('/', authenticateAdmin, addBus);
router.put('/', authenticateAdmin, updateBus);
router.delete('/:id', authenticateAdmin, deleteBus);

module.exports = router;