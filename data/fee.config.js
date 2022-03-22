const fs = require('fs');
const catchAsync = require('../utils/catchAsync');



// const feeConfig = JSON.parse('../data/fee.config.json', 'application/json');  
const feeConfig = JSON.parse(fs.readFileSync(`${__dirname}/fee.config.json`, 'utf-8'));


exports.setConfig = catchAsync(async (req, res, next) => {
    // pass the user info, so it can be used in the next miidle ware
    req.feeConfig = feeConfig; 

    next();
}); 