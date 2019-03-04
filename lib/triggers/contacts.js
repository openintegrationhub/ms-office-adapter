'use strict';

const messages = require('elasticio-node').messages;
const co = require('co');
const MicrosoftGraph = require('msgraph-sdk-javascript');
const _ = require('lodash');
const ApiClient = require('../apiClient');

function processAction(msg, cfg, snapshot)
{
    snapshot.lastModifiedDateTime = snapshot.lastModifiedDateTime || new Date(0).toISOString();

    const self = this;

    return co(function* mainLoop()
    {
        const instance = new ApiClient(cfg, self);

        const newAccessToken
          = yield instance.getRefreshedToken()
            .catch(() => this.emit('error', new Error('Failed to refresh token')));

        if (!newAccessToken)
        {
            return;
        }

        const client = MicrosoftGraph.init
        ({
            defaultVersion: 'v1.0',
            debugLogging: true,
            authProvider: (done) =>
            {
                done(null, newAccessToken);
            }
        });

        const contacts = yield client
            .api('/me/contacts')
            .orderby('lastModifiedDateTime asc')
            .top(900)
            .filter('lastModifiedDateTime gt ' + snapshot.lastModifiedDateTime)
            .get();

        const values = contacts.value;

        if (values.length > 0)
        {
            values.forEach((elem)=>
            {
                const messageBody = _.omitBy(elem, (value, key) => key.startsWith('@odata.'));
                messageBody.calendarId = cfg.calendarId;
                this.emit('data', messages.newMessageWithBody(messageBody));
            });

            let lmdate = new Date(values[values.length - 1].lastModifiedDateTime);

            lmdate.setMilliseconds(999);
            snapshot.lastModifiedDateTime = lmdate.toISOString();
        }

        this.emit('snapshot', snapshot);
    }.bind(this));
}

module.exports.process = processAction;