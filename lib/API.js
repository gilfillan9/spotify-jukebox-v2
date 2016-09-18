var app = require("express")();
var bodyParser = require('body-parser');;
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

var App = require("./App");
var Queue = require("./Queue");
var Spotify = require("./Spotify");
var VolumeManager = require("./VolumeManager");


app.get('/queue', function (req, res) {
    res.json({success: true, data: Queue.serialise(true)});
});

app.get('/queue/current', function (req, res) {
    res.json({success: true, data: Queue.serialiseTrack(Queue.getCurrent())})
});

app.post('/queue', function (req, res) {
    if (Array.isArray(req.body.tracks)) {
        Spotify.getTracks(req.body.tracks)
            .then((tracks) => Queue.addTracks(tracks, req.body.source))
            .then(() => res.json({success: true, data: Queue.serialise(true)}))
    } else {
        res.status(400);
        res.json({
            success: false,
            message: "Tracks must be an array of spotify uris"
        })
    }
});
app.post('/queue/order', function (req, res) {
    if (Array.isArray(req.body.tracks)) {
        Queue.reorder(req.body.tracks);
        res.json({success: true, data: Queue.serialise(true)});
    } else {
        res.status(400);
        res.json({
            success: false,
            message: "Tracks must be an array of spotify UUIDs"
        })
    }
});
app.post('/queue/save', function (req, res) {
    Queue.save().then(() => {
        res.json({
            success: true
        })
    }).catch((e) => {
        res.status(500);
        res.json({
            success: false,
            message: e
        })
    })
});;

app.post('/queue/skip/forward', function (req, res) {
    Queue.skip(1);
    res.json({success: true, data: Queue.serialise()});
});
app.post('/queue/skip/back', function (req, res) {
    Queue.skip(-1);
    res.json({success: true, data: Queue.serialise()});
});

app.get('/volume', function (req, res) {
    res.json({success: true, data: VolumeManager.serialise()});
});
app.post('/volume', function (req, res) {
    const volume = parseInt(req.body.volume);
    VolumeManager.setVolume(volume);
    res.json({success: true, data: VolumeManager.serialise()});
});
app.post('/volume/phone/on', function (req, res) {
    VolumeManager.setPhone(true);
    res.json({success: true, data: VolumeManager.serialise()});
});
app.post('/volume/phone/off', function (req, res) {
    VolumeManager.setPhone(false);
    res.json({success: true, data: VolumeManager.serialise()});
});

app.post('/player/play', function (req, res) {
    Spotify.setPlaying(true);
    res.json({success: true, data: App.getPlayState()});
});
app.post('/player/pause', function (req, res) {
    Spotify.setPlaying(false);
    res.json({success: true, data: App.getPlayState()});
});
app.post('/player/seek', function (req, res) {
    const time = parseInt(req.body.time);
    Spotify.seek(time);
    res.json({success: true, data: App.getPlayState()});
});
app.post('/player/shuffle/on', function (req, res) {
    Queue.setShuffled(true);
    res.json({success: true, data: App.getPlayState()});
});
app.post('/player/shuffle/off', function (req, res) {
    Queue.setShuffled(false);
    res.json({success: true, data: App.getPlayState()});
});


module.exports = app;
