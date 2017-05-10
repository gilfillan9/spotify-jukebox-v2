const app = require("express")();
const bodyParser = require('body-parser');
;
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

            if("string" === typeof e) {
                message = e;
            } else if(e instanceof Error) {
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

app.get('/queue', requestWrapper(function (req, res) {
    return Queue.serialise(true);
}));

app.get('/queue/current', requestWrapper(function (req, res) {
    return Queue.serialiseTrack(Queue.getCurrent());
}));

app.post('/queue', requestWrapper(function (req, res) {
    if (Array.isArray(req.body.tracks)) {
        return Spotify.getTracks(req.body.tracks)
            .then((tracks) => Queue.addTracks(tracks, req.body.source))
            .then(() => Queue.serialise(true))
    } else {
        throw new Error('Tracks must be an array of spotify uris');
    }
}));
app.post('/queue/order', requestWrapper(function (req, res) {
    if (Array.isArray(req.body.tracks)) {
        Queue.reorder(req.body.tracks);

        return Queue.serialise(true);
    } else {
        throw new Error("Tracks must be an array of spotify UUIDs");
    }
}));
app.post('/queue/save', requestWrapper(function (req, res) {
    return Queue.save().then(() => {
        return undefined;
    })
}));

app.post('/queue/skip/forward', requestWrapper(function (req, res) {
    Queue.skip(1);
    return Queue.serialise();
}));
app.post('/queue/skip/back', requestWrapper(function (req, res) {
    Queue.skip(-1);
    return Queue.serialise();
}));

app.get('/volume', requestWrapper(function (req, res) {
    return VolumeManager.serialise();
}));
app.post('/volume', requestWrapper(function (req, res) {
    const volume = parseInt(req.body.volume);
    VolumeManager.setVolume(volume);
    return VolumeManager.serialise();
}));
app.post('/volume/phone/on', requestWrapper(function (req, res) {
    VolumeManager.setPhone(true);
    return VolumeManager.serialise();
}));
app.post('/volume/phone/off', requestWrapper(function (req, res) {
    VolumeManager.setPhone(false);
    return VolumeManager.serialise();
}));

app.get('/player', requestWrapper(function (req, res) {
    return App.getPlayState();
}));
app.post('/player/play', requestWrapper(function (req, res) {
    Spotify.setPlaying(true);
    return App.getPlayState();
}));
app.post('/player/pause', requestWrapper(function (req, res) {
    Spotify.setPlaying(false);
    return App.getPlayState();
}));
app.post('/player/seek', requestWrapper(function (req, res) {
    const time = parseInt(req.body.time);
    Spotify.seek(time);
    return App.getPlayState();
}));
app.post('/player/shuffle/on', requestWrapper(function (req, res) {
    Queue.setShuffled(true);
    return App.getPlayState();
}));
app.post('/player/shuffle/off', requestWrapper(function (req, res) {
    Queue.setShuffled(false);
    return App.getPlayState();
}));


app.get('/accounts', requestWrapper(function (req, res) {
    return Spotify.listAccounts();
}));

app.post('/accounts', requestWrapper(function (req, res) {
    return Spotify.addAccount(req.body.id, req.body.username, req.body.password).then(() => Object.values(Spotify.listAccounts()));
}));

app.post('/accounts/switch', requestWrapper(function (req, res) {
    //TODO switch account
}));


module.exports = app;
