const MicrosoftGraph = require("msgraph-sdk-javascript");

const co = require("co");

module.exports = function verifyCredentials(credentials, cb)
{
    var client = MicrosoftGraph.init
    ({
        defaultVersion: "v1.0",
        debugLogging: false,
        authProvider: (done) =>
        {
            done(null, credentials.oauth.access_token);
        }
    });

    var process = co(function*()
    {
        var user = yield client.api("/me").get();
    });

    process.then(function ()
    {
        cb(null, {verified: true});
    }).catch(err =>
    {
        cb(null, {verified: false});
    });
};