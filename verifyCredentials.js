"use strict";

const request = require("request-promise");

module.exports = verify;

function verify(credentials)
{
    const apiKey = credentials.apiKey;

    if (!apiKey)
    {
        throw new Error("API-Key missing.");
    }

    const requestOptions =
    {
        uri: "https://graph.microsoft.com/v1.0/me/",

        headers:
        {
            // Authorization: Bearer eyJ0eXAiO ... 0X2tnSQLEANnSPHY0gKcgw
            // https://docs.microsoft.com/en-us/graph/auth-v2-service

            "Authorization": "Bearer " + apiKey
        },

        json: true
    };

    return request.get(requestOptions);
}