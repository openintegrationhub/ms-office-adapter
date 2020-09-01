const { newMessage } = require('../helpers');
const ApiClient = require('../apiClient');

module.exports.process = processAction;

async function processAction(msg, cfg)
{
    const instance = new ApiClient(cfg, this);

    const currentTime = msg.body.time || (new Date()).toISOString();

    // const events = await client
    //     .api('/me/events')
    //     .filter(`start/dateTime le '${currentTime}' and end/dateTime ge '${currentTime}'`)
    //     .get();

    const events = await apiClient.get('/me/events'); //@todo: filter

    return messages.newMessage
    ({
        available: !events.value.length
    });
}
