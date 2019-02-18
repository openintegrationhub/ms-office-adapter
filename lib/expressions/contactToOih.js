const jsonata = require('jsonata');

module.exports.getExpression = msg =>
{
  const expression =
  {
    displayName: msg.displayName,
    addresses:
    [{
      street: '',
      streetNumber: '',
      zipCode: '',
      city: '',
      country: ''
    }],
    contactData:
    [{
      value: msg.body.phone,
      type: 'phone',
      description: 'phone number'
    }]
  };

  return expression;
};