

exports.countryCurrency = (countryCode) => {
    const countryCurrencies = {
        'NG':'NGN',
        'US':'USD'
    };

    return countryCurrencies[countryCode];
}