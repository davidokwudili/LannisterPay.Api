const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { FeeEntityEnum, EntityPropertyEnum, LocaleEnum, FeeTypeEnum } = require('../common/enums');
const { countryCurrency } = require('../common/helper');



const validateRequest = async (tran, next) => {
    // validated requestbody
    if (!tran.Amount) return next(new AppError('Please provide transaction amount.', 204));
    // if (!tran.CurrencyCountry) return next(new AppError('Please provide currency country code.', 400));
    // if (!tran.Country) return next(new AppError('Please provide transaction country code amount.', 400)); 
};


const isLocalTransaction = async (currencyCountry, countryOfPayment) => {
    // check if values are not empty
    if (currencyCountry != '' && countryOfPayment != '') {
        // compare if it's local or intl
        if (currencyCountry == countryOfPayment) return LocaleEnum.LOCAL;
        else return LocaleEnum.INTERNATIONAL;
    }
    else
        return LocaleEnum.ALL;
};


const handleFCSFilter = async (req, transaction) => {

    // get the FCS(Fee Configuration Spec)
    let feeConfigSpec = []; feeConfigSpec = req.feeConfig;

    // get the property entity
    const { PaymentEntity } = transaction;

    // check if the {ENTITY-PROPERTY} was passed and filter
    if (PaymentEntity.Brand != '') {
        // if it was passed, filter the FCS
        feeConfigSpec = feeConfigSpec.filter((e) => {
            // return e.entityProperty == EntityPropertyEnum.MASTERCARD || e.entityProperty == EntityPropertyEnum.MTN
            return e.entityProperty == EntityPropertyEnum.ALL || e.entityProperty == PaymentEntity.Brand
        });
    }
    else {
        feeConfigSpec = feeConfigSpec.filter((e) => {
            return e.entityProperty == EntityPropertyEnum.ALL
        });
    }

    // check if the {FEE-ENTITY} was passed and filter
    if (PaymentEntity.Type != '') {
        // if it was passed, filter the FCS
        feeConfigSpec = feeConfigSpec.filter((e) => {
            return e.feeEntity == FeeEntityEnum.ALL || e.feeEntity == PaymentEntity.Type
            // return e.feeEntity == FeeEntityEnum.CREDITCARD || e.feeEntity == FeeEntityEnum.USSD
        });
    }
    else {
        feeConfigSpec = feeConfigSpec.filter((e) => {
            return e.feeEntity == FeeEntityEnum.ALL
        });
    }

    // filter {FEE-LOCALE}
    const locale = await isLocalTransaction(transaction.CurrencyCountry, PaymentEntity.Country);
    feeConfigSpec = feeConfigSpec.filter((e) => {
        return e.feeLocal == locale
    });

    // return the applyable fee config
    return feeConfigSpec;
};


exports.applyFee = async (applyableFeeConfig, transaction) => {
    const { feeId, feeType, feeValue } = applyableFeeConfig[0];
    const { Amount, Customer } = transaction;

    const chargedFee = {
        AppliedFeeID: feeId,
        AppliedFeeValue: 0,
        ChargeAmount: 0,
        SettlementAmount: 0
    }

     
    // calculate the based on the fee type
    if (feeType == FeeTypeEnum.FLAT) { 
        let value = +feeValue;

        // set obj
        // chargedFee.AppliedFeeValue = value;
        chargedFee.AppliedFeeValue = value;
    }
    else if (feeType == FeeTypeEnum.PERC) { 
        let value = +feeValue;

        // set obj
        chargedFee.AppliedFeeValue = (value / 100) * Amount;
    }
    else if (feeType == FeeTypeEnum.FLAT_PERC) { 
        let vlaues = feeValue.split(':');
        let flat = +vlaues[0];
        let perc = +vlaues[1];

        // set obj
        chargedFee.AppliedFeeValue = flat + ((perc / 100) * Amount);
    }

    // set the charge amount
    if (Customer.BearsFee == true) {
        chargedFee.ChargeAmount = (Amount + chargedFee.AppliedFeeValue);
    }
    else {
        chargedFee.ChargeAmount = Amount;
    }


    // set the settlement amount
    chargedFee.SettlementAmount = (chargedFee.ChargeAmount - chargedFee.AppliedFeeValue);

     

    return chargedFee;
}


exports.handleFeeTransaction = async (req, res, next) => {
    // get the request data
    let transaction = req.body;

    // validate the reuqest data
    await validateRequest(transaction, next);

    const applyableFeeConfig = await handleFCSFilter(req, transaction);

    return applyableFeeConfig;
};

