'use strict';

function adjustCurrency(amount) {
    return parseFloat(Math.round(amount * 100) / 100).toFixed(2);
}
