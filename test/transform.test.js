/**
 * Copyright 2019 Wice GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const { expect } = require('chai');

const { contactDataFromOih } = require('../lib/transformations/contactDataFromOih');
const { contactDataToOih } = require('../lib/transformations/contactDataToOih');

const oihContact = {
   "firstName":"Jane",
   "lastName":"Doe",
   "photo":"https://somephoto.jpg",
   "contactData":[
      {
         "type":"phone",
         "value":"0123456789",
         "uid":"jhpgymi1k3ecspvr"
      },
      {
         "type":"mobil",
         "value":"0190123456",
         "uid":"jhpgymi1k3ecspvdr"
      },
      {
         "type":"email",
         "value":"x@y.de.de",
         "description":"",
         "uid":"jhpgymi1k3ectafx"
      },
      {
         "type":"email",
         "value":"mail@bail.com",
         "description":"",
         "uid":"1di551k6ktq37t",
         "categories":[
            {
               "uid":"jhpgymi1k3ebtk1l",
               "label":"Private"
            }
         ]
      },
      {
         "type":"email",
         "value":"x@y.de.de",
         "uid":"1di551k6ktql7i"
      },
      {
         "type":"phone",
         "value":"+490123456",
         "uid":"1di551k6ktql7j"
      }
   ],
   "uid":"jhpgymi1k3ebtju0",
   "gender":"",
   "jobTitle":"",
   "nickname":"",
   "displayName":"",
   "middleName":"",
   "salutation":"",
   "title":"",
   "birthday":"21.01.1980",
   "addresses":[
      {
         "street":"Someroad",
         "streetNumber":"499",
         "unit":"",
         "zipcode":"22760",
         "city":"Somecity",
         "district":"",
         "region":"",
         "country":"",
         "countryCode":"",
         "primaryContact":"",
         "description":"",
         "contextRef":"",
         "uid":"1di551k6gest0j"
      }
   ],
   "lastUpdate":1595336203684,
   "meta":{
      "role":"TENANT_ADMIN",
      "user":"someuser",
      "tenant":"sometenant",
      "username":"x@y.de.de",
      "tenantRole":"TENANT_ADMIN"
   },
   "categories":[
      {
         "uid":"3nrcp1wrk7emcsq2",
         "label":"Kunde"
      }
   ]
};

const msContact = {
    birthday: '1980-01-21T00:00:00Z',
    homePhones: [ '0123456789', '+490123456' ],
    businessPhones: [],
    mobilePhone: '0190123456',
    emailAddresses: [
      { name: 'x@y.de.de', address: 'x@y.de.de' },
      { name: 'mail@bail.com', address: 'mail@bail.com' },
      { name: 'x@y.de.de', address: 'x@y.de.de' }
    ],
    imAddresses: [],
    homeAddress: {},
    businessAddress: {},
    otherAddress: {
      street: 'Someroad 499',
      city: 'Somecity',
      state: '',
      countryOrRegion: '',
      postalCode: '22760'
    },
    givenName: 'Jane',
    surname: 'Doe'
};

describe('transform from oih data to microsoft', () => {
  before(async () => {

  });

  it('should correctly transform OIH contact format to Microsoft Contact format', async () => {
    const result = contactDataFromOih(oihContact);

    expect(result).to.deep.equal(msContact);
  });

  it('should correctly transform  Microsoft Contact format to OIH contact format', async () => {
    msContact.folder = 'SomeFolder';
    const result = contactDataToOih(msContact);

    expect(result.firstName).to.equal('Jane');
    expect(result.lastName).to.equal('Doe');
    expect(result.gender).to.equal('');
    expect(result.birthday).to.equal('1980-01-21T00:00:00Z');

    expect(result.addresses).to.be.an('array');
    expect(result.addresses[0].street).to.equal('Someroad');
    expect(result.addresses[0].streetNumber).to.equal('499');
    expect(result.addresses[0].city).to.equal('Somecity');
    expect(result.addresses[0].zipcode).to.equal('22760');

    expect(result.contactData).to.be.an('array');
    expect(result.contactData).to.have.lengthOf(6);

    expect(result.contactData[0].type).to.equal('phone');
    expect(result.contactData[0].value).to.equal('0123456789');
    expect(result.contactData[2].type).to.equal('mobil');
    expect(result.contactData[2].value).to.equal('0190123456');
    expect(result.contactData[5].type).to.equal('email');
    expect(result.contactData[5].value).to.equal('x@y.de.de');

    expect(result.categories).to.be.an('array');
    expect(result.categories).to.have.lengthOf(1);
    expect(result.categories[0].label).to.equal('SomeFolder');
  });

});
