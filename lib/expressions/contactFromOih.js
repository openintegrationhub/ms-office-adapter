'use strict';

const jsonata = require('jsonata');

module.exports.getExpression = msg =>
{
  const rowids = (jsonata("$filter(${JSON.stringify(msg.body.oihApplicationRecords)}, function($v, $i, $a) { ($v.recordUid != '') })").evaluate());

  const expression =
  {
    rowid: rowids ? rowids.recordUid : '',
    displayName: msg.body.firstName +  msg.body.lastName,
    companyName: '',
    businessPhones: '',
    emailAddresses: (jsonata("$filter(${JSON.stringify(msg.body.contactData)}, function($v) { $v.type = 'email'})").evaluate()).value,
    homeAddress: '',
    businessAddress: ''
  };

  return expression;
};