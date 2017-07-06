const App = require("./App");
const request = require("request");
const config = require('../data/config.json');

const TokenManager = {
    expires: 0,
    getTokenPromise: null,
    token: null,
    timeout: null,
    getToken: function () {
        if (TokenManager.hasExpired()) {
            return TokenManager.renew();
        } else {
            if (TokenManager.needsRenew()) {
                TokenManager.renew();
            }
            return Promise.resolve(TokenManager.token);
        }
    },
    hasExpired: function () {
        return (new Date).getTime() > TokenManager.expires;
    },
    needsRenew: function () {
        return (new Date).getTime() > TokenManager.expires - (60 * 1000);
    },
    renew: function () {
        if (TokenManager.getTokenPromise) {
            return TokenManager.getTokenPromise;
        }
        let prom = new Promise(function (resolve) {
            if (!TokenManager.needsRenew()) {
                resolve(TokenManager.token);
            }
            request({
                url: "https://accounts.spotify.com/api/token",
                method: "POST",
                headers: {
                    Authorization: "Basic " + (new Buffer(config.spotify.id + ":" + config.spotify.secret)).toString("base64") //Get base64 encoded string of the API key
                },
                form: {
                    grant_type: "client_credentials"
                }
            }, function (err, message, response) {
                try {
                    response = JSON.parse(response);
                    TokenManager.token = response.access_token;
                    let duration = response.expires_in;
                    TokenManager.expires = (new Date).getTime() + duration * 1000;
                    console.log("Got access token %s", TokenManager.token);
                    resolve(TokenManager.token);

                    setTimeout(TokenManager.renew, (duration - 30) * 1000); //Renew 30 secs before expires
                } catch (e) {
                    TokenManager.expires = 0;
                    console.error("Invalid Response from Spotify", response);
                    setTimeout(() => TokenManager.renew(), 5 * 1000);
                }
            }.bind(this));
        });
        TokenManager.getTokenPromise = prom;
        prom.then(function (token) {
            TokenManager.getTokenPromise = null;
            App.getIo().emit("token", token);
        });
        return prom;
    }
};

module.exports = TokenManager;
