module.exports = function (app, server) {
    const App = {
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
    const Queue = require("./Queue");
    const VolumeManager = require("./VolumeManager");
    const Spotify = require("./Spotify");
    const io = require('socket.io')(server);

    io.on('connection', require('./Client'));

    Spotify.init().then(function () {
        Queue.load();
    }).catch(function (err) {
        console.error("Couldn't init spotify, ", err);
    });

    app.use('/api', require("./API"))
};
