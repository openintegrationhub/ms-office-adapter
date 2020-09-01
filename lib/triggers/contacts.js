'use strict';

const { newMessage } = require('../helpers');
const co = require('co');

const _ = require('lodash');
const ApiClient = require('../apiClient');

function processAction(msg, cfg, snapshot)
{
    snapshot.lastModifiedDateTime = snapshot.lastModifiedDateTime || new Date(0).toISOString();
    const iamToken = process.env.ELASTICIO_IAM_TOKEN;
    const self = this;

    return co(function* mainLoop()
    {
        const instance = new ApiClient(cfg, self);

        // const contacts = yield client
        //     .api('/me/contacts')
        //     .orderby('lastModifiedDateTime asc')
        //     .top(900)
        //     .filter('lastModifiedDateTime gt ' + snapshot.lastModifiedDateTime)
        //     .get();

        const contacts = await apiClient.get('/me/events'); //@todo: filter

        const values = contacts.value;

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

        if (values.length > 0)
        {
            values.forEach((elem)=>
            {
                meta.recordUid = "id";
                delete elem.id;
                const messageBody = _.omitBy(elem, (value, key) => key.startsWith('@odata.'));
                messageBody.calendarId = cfg.calendarId;

                contentWithMeta = {
                    meta,
                    data: messageBody
                };

                this.emit('data', newMessage(messageBody));
            });

            let lmdate = new Date(values[values.length - 1].lastModifiedDateTime);

            lmdate.setMilliseconds(999);
            snapshot.lastModifiedDateTime = lmdate.toISOString();
        }

        this.emit('snapshot', snapshot);
    }.bind(this));
}

module.exports.process = processAction;
