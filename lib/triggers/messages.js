const { newMessage } = require('../helpers');

const ApiClient = require('../apiClient');

module.exports.process = processAction;

async function processAction(msg, cfg)
{
    const instance = new ApiClient(cfg, this);

    let newAccessToken;

    const messageBody = await apiClient.get('/me/messages');

    const getApplicationUid = {
        uri: `http://component-repository.openintegrationhub.com/components/${process.env.ELASTICIO_COMP_ID}`,
        json: true,
        headers: {
            "Authorization" : `Bearer ${iamToken}`,
            }
    };

    const applicationUidResponse = await request.get(getApplicationUid);

    const appUid = applicationUidResponse.data.applicationUid;

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


    return messages.newMessage
    ({
        available: !events.value.length
    });
}
