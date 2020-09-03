const { expect } = require('chai');
const nock = require('nock');

const ApiClient = require('../lib/apiClient');

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
