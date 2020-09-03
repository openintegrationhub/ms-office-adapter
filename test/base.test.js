const { expect } = require('chai');
const nock = require('nock');

const ApiClient = require('../lib/apiClient');
const helpers = require('../lib/helpers');

let apiClient;

describe('apiClient for microsoft', () => {
  before(async () => {
    apiClient = new ApiClient({
      accessToken: 'SomeToken',
    });

    const getCallSuccess = nock('http://localhost:3099')
      .get('/v1.0/me/contacts')
      .reply(200, {hello: 'test'});

    const postCallSuccess = nock('http://localhost:3099')
      .post('/v1.0/me/contacts')
      .reply(200, {hello: 'test2'});

    const patchCallSuccess = nock('http://localhost:3099')
      .patch('/v1.0/me/contacts/1234')
      .reply(200, {hello: 'test3'});
  });

  it('Do a get call to microsoft correctly', async () => {
    const result = await apiClient.get('/me/contacts', [{test: 1}]);
    expect(result).to.be.an('object');
    expect(result).to.have.key('hello');
    expect(result.hello).to.equal('test');
  });

  it('Do a post call to microsoft correctly', async () => {
    const result = await apiClient.post('/me/contacts', [{test: 1}]);
    expect(result).to.be.an('object');
    expect(result).to.have.key('hello');
    expect(result.hello).to.equal('test2');
  });

  it('Do a patch call to microsoft correctly', async () => {
    const result = await apiClient.patch('/me/contacts/1234', [{test: 1}]);
    expect(result).to.be.an('object');
    expect(result).to.have.key('hello');
    expect(result.hello).to.equal('test3');
  });

});


const msContactOld = {
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

const msContactNew = {
    birthday: '1980-01-22T00:00:00Z',
    homePhones: [ '0123456789', '+490123456', '123456' ],
    businessPhones: ['007'],
    mobilePhone: '01771234567',
    emailAddresses: [
      { name: 'x@y.de.de', address: 'x@y.de.de' },
      { name: 'mail@bail.com', address: 'mail@bail.com' },
      { name: 'a@neu.de', address: 'a@neu.de' }
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

describe('mergeArrays', () => {
  before(async () => {

  });

  it('Should merge two contact entries correctly', async () => {
    const result = helpers.mergeArrays(msContactNew, msContactOld);

    expect(result).to.deep.equal({
      birthday: '1980-01-22T00:00:00Z',
      homePhones: [ '0123456789', '+490123456', '123456' ],
      businessPhones: [ '007' ],
      mobilePhone: '01771234567',
      emailAddresses: [
        { name: 'x@y.de.de', address: 'x@y.de.de' },
        { name: 'mail@bail.com', address: 'mail@bail.com' },
        { name: 'x@y.de.de', address: 'x@y.de.de' },
        { name: 'a@neu.de', address: 'a@neu.de' }
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
    });

  });

});
