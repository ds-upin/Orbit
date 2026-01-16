const express = require('express');
const { getBus, getBuses, addBus, updateBus, deleteBus } = require('../controllers/busServiceControllers/busController');

const router = express.Router();

router.get('/:limit/:skip', getBuses);
router.get('/:id', getBus);
router.post('/', addBus);
router.put('/', updateBus);
router.delete('/:id', deleteBus);

module.exports = router;