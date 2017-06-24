var Queue = require("./Queue");
var TokenManager = require("./TokenManager");
var Spotify = require("./Spotify");
var App = require("./App");
var VolumeManager = require("./VolumeManager");

module.exports = function (socket) {
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
