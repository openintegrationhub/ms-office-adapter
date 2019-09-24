const elasticio = require('elasticio-node');
const messages = elasticio.messages;
const MicrosoftGraph = require('msgraph-sdk-javascript');
const ApiClient = require('../apiClient');

module.exports.process = processAction;

async function processAction(msg, cfg)
{
    const instance = new ApiClient(cfg, this);

    let newAccessToken;

    try
    {
        newAccessToken = await instance.getRefreshedToken();
    }
    catch (e)
    {
        throw new Error('Failed to refresh token.');
    }

    if (!newAccessToken)
    {
        return;
    }

    const client = MicrosoftGraph.init
    ({
        defaultVersion: 'v1.0',
        debugLogging: true,
        authProvider: done =>
        {
            done(null, newAccessToken);
        }
    });

    const events = await client
        .api('/me/messages')
        .get();

    let meta = {
      applicationUid: (appUid!=undefined && appUid!=null) ? appUid : 'appUid not set yet',
      iamToken: (iamToken!=undefined && iamToken!=null) ? iamToken : 'iamToken not set yet',
    
    }
    let contentWithMeta;

    meta.recordUid = "id";
    delete elem.id;

    contentWithMeta = {
      meta,
      data: messageBody
    };


    return messages.newMessageWithBody
    ({
        available: !events.value.length
    });
}