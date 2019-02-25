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

    const currentTime = msg.body.time || (new Date()).toISOString();

    const events = await client
        .api('/me/events')
        .filter(`start/dateTime le '${currentTime}' and end/dateTime ge '${currentTime}'`)
        .get();

    return messages.newMessageWithBody({
        available: !events.value.length
    });
}