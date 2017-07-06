const app = require("express")();
const bodyParser = require('body-parser');
const cors = require("cors");

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use(cors());

const App = require("./App");
const Queue = require("./Queue");
const Spotify = require("./Spotify");
const VolumeManager = require("./VolumeManager");


function requestWrapper(fn) {
    if ("function" !== typeof fn) throw new Error('Invalid API request handler: ' + fn);
    return function (req, res) {
        Promise.resolve(fn.apply(this, arguments)).then((data) => {
            res.json({success: true, data: data});
        }).catch((e) => {
            let message;

            if ("string" === typeof e) {
                message = e;
            } else if (e instanceof Error) {
                message = e.message;
            } else {
                message = "Unknown error";
            }
            res.status(500);
            res.json({
                success: false,
                message: message
            })
        });
    }
}

app.get('/queue', requestWrapper(function () {
    return Queue.serialise(true);
}));

app.get('/queue/current', requestWrapper(function () {
    return Queue.serialiseTrack(Queue.getCurrent());
}));

app.post('/queue', requestWrapper(function (req) {
    if (Array.isArray(req.body.tracks)) {
        return Spotify.getTracks(req.body.tracks)
            .then((tracks) => Queue.addTracks(tracks, req.body.source))
            .then(() => Queue.serialise(true))
    } else {
        throw new Error('Tracks must be an array of spotify uris');
    }
}));
app.delete('/queue', requestWrapper(function () {
    Queue.clear();
}));
app.delete('/queue/:uuid', requestWrapper(function (req) {
    Queue.removeTrack(req.params.uuid);
}));
app.post('/queue/order', requestWrapper(function (req) {
    if (Array.isArray(req.body.tracks)) {
        Queue.reorder(req.body.tracks);

        return Queue.serialise(true);
    } else {
        throw new Error("Tracks must be an array of spotify UUIDs");
    }
}));
app.post('/queue/save', requestWrapper(function () {
    return Queue.save().then(() => {
        return undefined;
    })
}));

app.post('/queue/skip/forward', requestWrapper(function () {
    Queue.skip(1);
    return Queue.serialise();
}));
app.post('/queue/skip/back', requestWrapper(function () {
    Queue.skip(-1);
    return Queue.serialise();
}));

app.get('/volume', requestWrapper(function () {
    return VolumeManager.serialise();
}));
app.post('/volume', requestWrapper(function (req) {
    const volume = parseInt(req.body.volume);
    VolumeManager.setVolume(volume);
    return VolumeManager.serialise();
}));
app.post('/volume/phone/on', requestWrapper(function () {
    VolumeManager.setPhone(true);
    return VolumeManager.serialise();
}));
app.post('/volume/phone/off', requestWrapper(function () {
    VolumeManager.setPhone(false);
    return VolumeManager.serialise();
}));

app.get('/player', requestWrapper(function () {
    return App.getPlayState();
}));
app.post('/player/play', requestWrapper(function () {
    Spotify.setPlaying(true);
    return App.getPlayState();
}));
app.post('/player/pause', requestWrapper(function () {
    Spotify.setPlaying(false);
    return App.getPlayState();
}));
app.post('/player/seek', requestWrapper(function (req) {
    const time = parseInt(req.body.time);
    Spotify.seek(time);
    return App.getPlayState();
}));
app.post('/player/shuffle/on', requestWrapper(function () {
    Queue.setShuffled(true);
    return App.getPlayState();
}));
app.post('/player/shuffle/off', requestWrapper(function () {
    Queue.setShuffled(false);
    return App.getPlayState();
}));


app.get('/settings', requestWrapper(function () {
    return Promise.all([
        Spotify.getCurrentAccount(),
        Spotify.listAccounts()
    ]).then((args) => ({
        activeAccount: {
            id: args[0].id,
            username: args[0].username,
        },
        accounts: Object.values(args[1])
    }))
}));

app.get('/settings/accounts', requestWrapper(function () {
    return Spotify.listAccounts().then((accounts) => Object.values(accounts));
}));

app.post('/settings/accounts', requestWrapper(function (req) {
    return Spotify.addAccount(req.body.id, req.body.username, req.body.password)
        .then(() => Spotify.listAccounts())
        .then((accounts) => Object.values(accounts));
}));

app.post('/settings/accounts/switch', requestWrapper(function (req) {
    return new Promise(function (resolve, reject) {
        let current = Object.assign({}, Spotify.user);
        Spotify.listAccounts(true).then((accounts) => {
            if ("undefined" !== typeof accounts[req.body.id]) {
                Spotify.switchAccount(accounts[req.body.id]).then(function () {
                    resolve();
                }).catch(function () {
                    console.log("Couldn't switch account. Switching back...");
                    //REJECTED!
                    Spotify.switchAccount(current);
                    reject("Couldn't switch spotify account")
                })
            } else {
                reject("Invalid spotify account selected")
            }
        }).catch(reject)
    })
}));


module.exports = app;
