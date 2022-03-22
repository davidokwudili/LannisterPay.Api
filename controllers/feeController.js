const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { handleFeeTransaction, applyFee } = require('../services/feeService');


exports.feeConfig = catchAsync(async (req, res, next) => {

});



exports.computeFeeTransaction = catchAsync(async (req, res, next) => {

    const applyableFeeConfig = await handleFeeTransaction(req, res, next);

    if (applyableFeeConfig.length <= 0 || applyableFeeConfig == null || applyableFeeConfig == undefined) {
        return next(new AppError('This payment cannot be processed as there is no configuration set for it.', 404));
    }

    const chargedFee = await applyFee(applyableFeeConfig, req.body);

    res.status(201).json({
        status: 'ok',
        data: chargedFee
    });
}); 