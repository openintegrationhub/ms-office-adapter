"use strict";

const request = require("request-promise");
const messages = require("elasticio-node").messages;

exports.process = processTrigger;

function processTrigger(cfg)
{
    let profile = [];
    let self = this;
    let apiKey = cfg.apikey;
    let uri = "https://graph.microsoft.com/v1.0/me/";

    let requestOptions = 
    {
        headers:
        {
            // Authorization: Bearer eyJ0eXAiO ... 0X2tnSQLEANnSPHY0gKcgw
            // https://docs.microsoft.com/en-us/graph/auth-v2-service

            "Authorization": "Bearer " + apiKey
        }
    };

    request.post(uri, requestOptions).then
    (
        (res) => 
        {
            profile = res.content;
            emitData();
        },
        (err) =>
        {
            emitError();
        }
    );

    function emitData()
    {
        let data = messages.newMessageWithBody
        ({
            "profile": profile
        });

        self.emit("data", data);
    }

    function emitError(e)
    {
        self.emit("error", e);
    }
}