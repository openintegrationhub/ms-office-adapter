'use strict';

const request = require('request-promise');

function ApiClient(config, component) {

    const microsoftGraphURI = (process.env.NODE_ENV && process.env.NODE_ENV === 'test')  ? 'http://localhost:3099/v1.0' : 'https://graph.microsoft.com/v1.0';

    console.log('microsoftGraphURI', microsoftGraphURI);
    // const refreshTokenURI = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

    // function refreshToken() {
    //
    //     let options = {
    //         method: 'POST',
    //         uri: refreshTokenURI,
    //         json: true,
    //         form: {
    //             refresh_token: config.oauth.refresh_token,
    //             scope: config.oauth.scope,
    //             grant_type: 'refresh_token',
    //             client_id: process.env.MSAPP_CLIENT_ID,
    //             client_secret: process.env.MSAPP_CLIENT_SECRET
    //         }
    //     };
    //
    //     function emitUpdateKeys(responseBody) {
    //         if (component) {
    //             component.emit('updateKeys', {
    //                 oauth: responseBody
    //             });
    //         }
    //
    //         return responseBody;
    //     }
    //
    //     function getAuthorizationHeader(body) {
    //         return body.access_token;
    //     }
    //
    //     return request(options).then(emitUpdateKeys).then(getAuthorizationHeader);
    // }

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
            console.log('get options:', options);
            return await request(options);
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
            console.log('get options:', options);
            return await request(options);
        },

        // getRefreshedToken: refreshToken
    };
}

module.exports = ApiClient;
