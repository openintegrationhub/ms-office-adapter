const _ = require('lodash');
const { newMessage } = require('../helpers');
const ApiClient = require('../apiClient');
const processContactData = require('../processContactDataHelper').processContactData;

function processAction(msg, cfg)
{
    const self = this;
    const apiCall = `me/contacts`;
    const instance = new ApiClient(cfg, self);

    console.log("Hi, you reached FLAG 1!");

    function addContact(postRequestBody)
    {
        console.log("Hi, you reached FLAG 3- adding the Contact!");
        return instance.post(apiCall, postRequestBody);
    }

    function emitData(data)
    {
        console.log("Hi, you reached FLAG 4- emitting the data!");
        const id = data.id;
        const messageBody = _.omitBy(data, (value, key) => key.startsWith('@odata.'));
        messageBody.companyName = cfg.companyName;
        messageBody.surname = cfg.surname;
        messageBody.givenName = cfg.givenName;
        messageBody.emailAddresses = cfg.emailAddresses;
        messageBody.businessPhones = cfg.businessPhones;
        self.emit('data', newMessage(messageBody));
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
