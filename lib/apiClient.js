'use strict';

const request = require('request-promise');

function ApiClient(config, component) {

    const microsoftGraphURI = (process.env.NODE_ENV && process.env.NODE_ENV === 'test')  ? 'http://localhost:3099/v1.0' : 'https://graph.microsoft.com/v1.0';

    console.log('microsoftGraphURI', microsoftGraphURI);

    return {

        post: async function postReq(apiCall, requestBody) {

            function setOptions(accessToken) {
                let requestHeaders = {
                    Authorization: 'Bearer ' + accessToken
                };
                let options = {
                    method: 'POST',
                    uri: microsoftGraphURI + apiCall,
                    json: true,
                    body: requestBody,
                    headers: requestHeaders
                };

                return options;
            }

            // return refreshToken().then(setOptions).then(request);
            const options = setOptions(config.accessToken);
            console.log('Post options:', options);
            const result = await request(options);
            console.log('Result:', result);
            return result;
        },
        get: async function getReq(apiCall) {

            function setOptions(accessToken) {
                let requestHeaders = {
                    Authorization: 'Bearer ' + accessToken
                };
                let options = {
                    method: 'GET',
                    uri: microsoftGraphURI + apiCall,
                    json: true,
                    headers: requestHeaders
                };

                return options;
            }

            // return refreshToken().then(setOptions).then(request);
            const options = setOptions(config.accessToken);
            console.log('Get options:', options);
            const result = await request(options);
            console.log('Result:', result);
            return result;
        },

        // getRefreshedToken: refreshToken
    };
}

module.exports = ApiClient;
