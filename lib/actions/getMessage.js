const elasticio = require('elasticio-node');
const messages = elasticio.messages;
const _ = require('lodash');

const ApiClient = require('../apiClient');
const processMessageData = require('../processMessageDataHelper').processMessageData;

function processAction(msg, cfg) {
    const self = this;
    const apiCall = `me/messages`;
    const instance = new ApiClient(cfg, self);

    function addContact(postRequestBody) {
        return instance.post(apiCall, postRequestBody);
    }

    function emitData(data) {
        const id = data.id;
        const messageBody = _.omitBy(data, (value, key) => key.startsWith('@odata.'));
        messageBody.subject = cfg.subject;
        messageBody.body = cfg.body;
        messageBody.sender = cfg.sender;
        messageBody.from = cfg.from;
        messageBody.toRecipients = cfg.toRecipients;
        messageBody.ccRecipients = cfg.ccRecipients;
        self.emit('data', messages.newMessageWithBody(messageBody));
    }

    function emitError(e) {
        self.emit('error', e);
    }

    function emitEnd() {
        self.emit('end');
    }

    let promise = processMessageData(cfg, msg.body)
        .then(createEvent)
        .then(emitData);

    return promise.finally(emitEnd);
}

module.exports.process = processAction;