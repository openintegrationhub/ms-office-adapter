"use strict";

const request = require("request-promise");
const messages = require("elasticio-node").messages;

exports.process = processTrigger;

function processTrigger(cfg)
{
    let profile = [];
    let self = this;
    let apiKey = cfg.apikey;
    let uri = "https://graph.microsoft.com/v1.0/me/contacts";

    let requestOptions = 
    {
        headers:
        {
            // Authorization: Bearer eyJ0eXAiO ... 0X2tnSQLEANnSPHY0gKcgw
            // https://docs.microsoft.com/en-us/graph/auth-v2-service

            "Authorization": "Bearer " + apiKey,
            "Content-type": "application/json"
        },
        body:
        {
          "givenName": "Pavel",
          "surname": "Bansky",
          "emailAddresses":
          [
            {
              "address": "pavelb@fabrikam.onmicrosoft.com",
              "name": "Pavel Bansky"
            }
          ],
          "businessPhones":
          [
            "+1 732 555 0102"
          ]
        },
        json: true
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