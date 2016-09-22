
var requireLocalizations = require('./output/all');
var l = requireLocalizations('en-US');
var x = l(
    'NEW_KEY'
);
console.log(l('TEST', { test: 1260 }));
console.log(l('CURRENCY', {
  price: {
    code: 'USD',
    amount: 0
  }
}))
