import Spotify from "spotify-web-api-js";
import async from "async";
import copy from "deep-copy";

const trackCache = [];

var resolveFunction = null;
const client = new Spotify();
const getTracksOrig = client.getTracks
const setAccessTokenOrig = client.setAccessToken
const loadPromise = new Promise(function (resolve) {
    resolveFunction = resolve;
});

client.getTracks = function (uris) {
    return new Promise(function (resolve) {
        if (uris.length == 0) resolve([]); //Don't do nought for an empty list...
        var uncachedTracks = uris.filter(function (track) {
            return "undefined" == typeof trackCache["string" === typeof track ? track : track.id]
        })
        var tracksSplit = [];
        if (uncachedTracks.length > 0) {
            var i, chunk = 50;
            for (i = 0; i < uncachedTracks.length; i += chunk) {
                uncachedTracks.slice(i, i + chunk);
                tracksSplit.push(uncachedTracks.slice(i, i + chunk).map(function (track) {
                    return "string" === typeof track ? track : track.id;
                }));
            }
        }
        async.each(tracksSplit, function (item, cb) {
            getTracksOrig(item).then(function (result) {
                result.tracks.forEach(function (track) {
                    if (track == null) return;
                    trackCache[track.id] = track;
                });
                cb();
            })
        }, function () {
            var tracks = uris.map(function (track) {
                if ("object" === typeof track) {
                    var _track = copy(trackCache[track.id]); //Make a copy;
                    _track.uuid = track.uuid;
                    _track.source = track.source;
                } else {
                    var _track = copy(trackCache[track]);
                }
                return _track;
            });

            resolve(tracks)
        })
    });
};

client.setAccessToken = function (token) {
    setAccessTokenOrig.call(client, token);
    resolveFunction();
};

client.load = function () {
    return loadPromise;
};


export default client;
