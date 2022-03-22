const express = require('express');   

const feeCon = require('../controllers/feeController');

const router = express.Router();

router.post('/fees', feeCon.feeConfig);
router.post('/compute-transaction-fee', feeCon.computeFeeTransaction);

module.exports = router;