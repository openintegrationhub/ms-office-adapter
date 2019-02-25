const elasticio = require('elasticio-node');
const messages = elasticio.messages;
const MicrosoftGraph = require('msgraph-sdk-javascript');
const ApiClient = require('../apiClient');

module.exports.process = processAction;

async function processAction(msg, cfg) {

    const instance = new ApiClient(cfg, this);

    let newAccessToken;

    try {
        newAccessToken = await instance.getRefreshedToken();
    } catch (e) {
        throw new Error('Failed to refresh token');
    }

    if (!newAccessToken) {
        return;
    }

    const client = MicrosoftGraph.init({
        defaultVersion: 'v1.0',
        debugLogging: true,
        authProvider: done => {
            done(null, newAccessToken);
        }
    });

    let time = msg.body.time || (new Date()).toISOString();

    const events = await client
        .api('/me/events')
        .filter(`start/dateTime le '${time}' and end/dateTime ge '${time}'`)
        .get();

    if (events.value.length) {
        time = events.value.pop().end.dateTime;
    }

    return messages.newMessageWithBody({
        time,
        subject: msg.body.subject
    });
}