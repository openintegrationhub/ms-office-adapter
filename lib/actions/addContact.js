const elasticio = require('elasticio-node');
const messages = elasticio.messages;
const _ = require('lodash');
const ApiClient = require('../apiClient');
const processContactData = require('../processContactDataHelper').processContactData;

function processAction(msg, cfg)
{
    const self = this;
    const apiCall = `me/contacts`;
    const instance = new ApiClient(cfg, self);

    function addContact(postRequestBody)
    {
        return instance.post(apiCall, postRequestBody);
    }

    function emitData(data)
    {
        const id = data.id;
        const messageBody = _.omitBy(data, (value, key) => key.startsWith('@odata.'));
        messageBody.companyName = cfg.companyName;
        messageBody.surname = cfg.surname;
        messageBody.givenName = cfg.givenName;
        messageBody.emailAddresses = cfg.emailAddresses;
        messageBody.businessPhones = cfg.businessPhones;
        self.emit('data', messages.newMessageWithBody(messageBody));
    }

    function emitError(e)
    {
        self.emit('error', e);
    }

    function emitEnd()
    {
        self.emit('end');
    }

    let promise = processContactData(cfg, msg.body)
        .then(addContact)
        .then(emitData);

    return promise.finally(emitEnd);
}

module.exports.process = processAction;