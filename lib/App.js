module.exports = function (app, server) {
    var App = {
        getPlayState: function () {
            return {
                playing: Spotify.isPlaying(),
                shuffled: Queue.isShuffled(),
                phone: VolumeManager.isPhone()
            }
        },
        updatePlayState: function () {
            io.emit('playState', App.getPlayState());
        },
        setPlayState: function (playState) {
            Queue.setShuffled(playState.shuffled, true);
            VolumeManager.setPhone(playState.phone, true);
            Spotify.setPlaying(playState.playing, true);

            App.updatePlayState();
        },
        getIo: function () {
            return io;
        }
    };
    module.exports = App;
    var Queue = require("./Queue");
    var VolumeManager = require("./VolumeManager");
    var Spotify = require("./Spotify");
    var io = require('socket.io')(server);

    io.on('connection', require('./Client'));

    Spotify.init().then(function () {
        Queue.load();
    }).catch(function (err) {
        console.error("Couldn't init spotify, ", err);
    });

    app.use('/api', require("./API"))
};
