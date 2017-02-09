'use strict';
var amount = document.getElementById('amount'),
    currency1 = document.getElementById('fromCurrency'),
    currency2 = document.getElementById('toCurrency'),
    rate = 0,
    result = document.getElementById('result');


// rate = getCurrencyData(currency1.value, currency2.value);
getCurrencyData(currency1.value, currency2.value);

function convertMoney() {
    result.value = adjustCurrency(amount.value * rate);
}

function getCurrencyData(oldCurrency, newCurrency) {
    getJSON('https://api.fixer.io/latest?base=' + oldCurrency).then(function(data) {
        if(Object.keys(data.rates).indexOf(newCurrency) !== -1) {
            rate = data.rates[newCurrency];
            convertMoney();
        } else {

            rate = 1;
            convertMoney();
        }

    }, function(status) { //error detection....
        alert('Something went wrong.');
        return {};
    });
}

var currencyChanged = function currencyChanged() {
        getCurrencyData(currency1.value, currency2.value);

};

function swapCurrency(event) {
    event.preventDefault();
    var oldValues = {
        amount: amount.value,
        result: result.value,
        currency1: currency1.value,
        currency2: currency2.value
    };

    currency1.value = oldValues.currency2;
    currency2.value = oldValues.currency1;
    getCurrencyData(currency1.value, currency2.value);
}
