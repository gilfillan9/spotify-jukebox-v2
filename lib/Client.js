var Queue = require("./Queue");
var TokenManager = require("./TokenManager");
var Spotify = require("./Spotify");
var App = require("./App");
var VolumeManager = require("./VolumeManager");

module.exports = function (socket) {
    socket.on('playState', (playState) => App.setPlayState(playState));
    socket.on('volume', (volume) => VolumeManager.setVolume(volume));
    socket.on('reorder', (uuids) => Queue.reorder(uuids));
    socket.on('removeTrack', (uuid) => Queue.removeTrack(uuid));
    socket.on('seek', (time) => Spotify.seek(time));
    socket.on('skip', (direction) => Queue.skip(direction));
    socket.on("kill", () => {
        console.log("Kill received. Killing now");
        process.exit();
    });

    TokenManager.getToken().then((token) => {
        socket.emit('token', token);
        socket.emit('playState', App.getPlayState());
        socket.emit('queue', Queue.serialise());
        socket.emit('volume', VolumeManager.getVolume());
        socket.emit("seek", Spotify.lastTime);
    });
};
