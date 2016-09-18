var Queue = require("./Queue");
var TokenManager = require("./TokenManager");
var Spotify = require("./Spotify");
var App = require("./App");
var VolumeManager = require("./VolumeManager");

module.exports = function (socket) {
    var server = new (require('socket.io-reqres').Server)();

    socket.on('playState', (playState) => App.setPlayState(playState));
    socket.on('volume', (volume) => VolumeManager.setVolume(volume));
    socket.on('reorder', (uuids)=> Queue.reorder(uuids));
    socket.on('removeTrack', (uuid) => Queue.removeTrack(uuid));
    socket.on('addTrack', (uri) => Spotify.getTrack(Array.isArray(uri) ? uri : uri.track).then((track) => Queue.addTrack(track, Array.isArray(uri) ? null : uri.source)));
    socket.on('addTracks', (uris) => Spotify.getTracks(Array.isArray(uris) ? uris : uris.tracks).then((tracks) => Queue.addTracks(tracks, Array.isArray(uris) ? null : uris.source)));
    socket.on('replaceTracks', (uris) => {
        Queue.clear(true);
        Spotify.getTracks(Array.isArray(uris) ? uris : uris.tracks).then((tracks) => Queue.addTracks(tracks, Array.isArray(uris) ? null : uris.source))
    });
    socket.on('clear', (id) => Queue.clear());
    socket.on('seek', (time) => Spotify.seek(time));
    socket.on('skip', (direction) => Queue.skip(direction));
    socket.on('save', () => Queue.save());
    socket.on('switchAccount', (accountId) => {
        var current = Spotify.user.id;
        Spotify.listAccounts().then((accounts) => {
            if ("undefined" !== typeof accounts[accountId]) {
                Spotify.switchAccount(accounts[accountId]).then(function () {

                }).catch(function () {
                    console.log("Couldn't switch account. Switching back...");
                    //REJECTED!
                    Spotify.switchAccount(current);
                })
            } else {
                //REJECTED!
            }
        })
    });
    socket.on("kill", () => {
        console.log("Kill received. Killing now");
        process.exit();
    });

    server.use('settings', (data, res) => {
        Promise.all([
            Spotify.getCurrentAccount(),
            Spotify.listAccounts()
        ]).then((args) => {
            res({
                success: true,
                data: {
                    activeAccount: {
                        id: args[0].id,
                        username: args[0].username,
                    },
                    accounts: Object.keys(args[1]).map((key) => ({
                        id: args[1][key].id,
                        username: args[1][key].username
                    }))
                }
            })
        }).catch((error) => {
            res({
                success: false,
                message: error.message
            })
        })
    });

    server.use('addAccount', (data, res) => {
        Spotify.addAccount(data.id, data.username, data.password).then(() => {
            return Spotify.listAccounts()
        }).then(function (accounts) {
            res({
                success: true,
                accounts: Object.keys(accounts).map((key) => ({
                    id: accounts[key].id,
                    username: accounts[key].username
                }))
            })
        }).catch((err) => {
            res({
                success: false,
                message: err.message
            })
        })
    });

    TokenManager.getToken().then((token) =>socket.emit('token', token));

    socket.emit('queue', Queue.serialise());
    socket.emit('playState', App.getPlayState());
    socket.emit('volume', VolumeManager.getVolume());

    server.setSocket(socket);
};
