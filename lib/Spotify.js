const config = require('../data/config.json');
const Queue = require('./Queue');
const App = require('./App');
const fs = require('fs');
const debounce = require("debounce");

const spotify = require('node-spotify')({
    appkeyFile: config.spotify.appKeyLocation
});

const debouncedSeek = debounce((time) => {
    spotify.player.seek(parseInt(time));
}, 100);

const Spotify = {
    lastTime: false,
    currentTrack: null,
    playing: false,
    user: null,
    init: function () {
        spotify.player.on({
            endOfTrack: function () {
                Queue.skip(1);
            }
        });


        setInterval(function () {
            if (spotify.player.currentSecond != Spotify.lastTime) {
                Spotify.lastTime = spotify.player.currentSecond;
                App.getIo().emit("seek", Spotify.lastTime);
            }
        }, 1000);

        return Spotify.getCurrentAccount().then(Spotify.login);
    },
    seek: function (time) {
        App.getIo().emit("seek", parseInt(time));
        debouncedSeek(time);
    },
    isPlaying: function () {
        return Spotify.playing;
    },
    setPlaying: function (playing, noUpdate) {
        const current = Queue.getCurrent();
        if (current !== null && playing) {
            Spotify.playing = true;
            if (Spotify.currentTrack === current) {
                spotify.player.resume();
            } else {
                Spotify.playTrack(current);
            }
        } else {
            spotify.player.pause();
            Spotify.playing = false;
        }
        noUpdate || App.updatePlayState();
    },
    playTrack: function (track) {
        Spotify.currentTrack = track;
        if (track !== null) {
            return Spotify.load(track).then(function () {
                try {
                    if (Spotify.currentTrack === track) {
                        console.log('Playing: %s - %s', track.artists[0].name, track.name);
                        spotify.player.stop();
                        spotify.player.play(track);

                        Spotify.playing = true;
                    }
                } catch (e) {
                    console.log("Player Error", e);
                    Queue.skip(1); //Skip to the next track
                }
            })
        } else {
            spotify.player.stop();
            return Promise.resolve();
        }
    },
    getTrack: function (uri) {
        if ("undefined" === typeof uri) {
            return Promise.resolve(undefined);
        }
        return Spotify.load(spotify.createFromLink(uri))
    },
    getTracks: function (uris) {
        let promises = [];
        uris.forEach(function (uri) {
            promises.push(Spotify.getTrack(uri))
        });
        return Promise.all(promises);
    },
    load: function (item) {
        return new Promise(function (resolve) {
            if (!item.isLoaded) {
                let interval = setInterval(function () {
                    if (item.isLoaded) {
                        clearInterval(interval);
                        resolve(item)
                    }
                }, 100);
            } else {
                resolve(item)
            }
        });
    },
    login: function (user) {
        return new Promise((resolve, reject) => {
            let timeout = setTimeout(() => reject('Timed out'), 5000);
            console.log("Logging in with", user.username);
            Spotify.setPlaying(false);
            spotify.on({
                ready: function (err) {
                    clearTimeout(timeout);
                    if (err) {
                        reject(err);
                        return;
                    }
                    console.log("Logged in!");
                    resolve();
                },
                playTokenLost: function () {
                    //TODO message n ting
                    Spotify.playing = false;
                    App.updatePlayState();
                }
            });

            spotify.login(user.username, user.password);
            Spotify.user = user;
        });
    },
    switchAccount: function (user) {
        Spotify.setPlaying(false);
        return Queue.save().then(() => {
            return new Promise((resolve) => {
                console.log("Switching to user", user.username);
                fs.writeFileSync("data/currentAccount.json", JSON.stringify(user.id));
                console.log("Attempting to log in...")
                Spotify.login(user).then(() => {
                    console.log("Log in successful");
                    App.getIo().emit("accountChanged", {id: user.id, username: user.username});
                    resolve();
                }).catch((e) => {
                    console.log("Couldn't log in. Restarting to apply new account");
                    process.exit();
                })
            })
        });
    },
    addAccount: function (id, username, password) {
        console.log("Add Account", id);
        return new Promise((resolve, reject) => {
            fs.stat('data/accounts/' + id + ".json", function (err) {
                if (err) {
                    fs.writeFile('data/accounts/' + id + ".json", JSON.stringify({
                        username: username,
                        password: password,
                        id: id
                    }), function (err) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve();
                    })
                } else {
                    reject(new Error("Account already exists!"));
                }

            })
        });
    },
    listAccounts: function (includePassword = false) {
        return new Promise((resolve, reject) => {
            if (fs.statSync('data/accounts')) {
                fs.readdir('data/accounts', (err, files) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    Promise.all(files.map((file) => new Promise((resolve, reject) => {
                            fs.readFile("data/accounts/" + file, (err, data) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }
                                const nameParts = file.split(".");
                                nameParts.pop();
                                data = JSON.parse(data)

                                if (!includePassword) {
                                    delete data.password;
                                }
                                resolve({id: nameParts.join("."), data: data});
                            })
                        })
                    )).then((files) => {
                        const accounts = {};

                        files.forEach((file) => {
                            accounts[file.id] = file.data;
                        });

                        resolve(accounts);
                    }).catch(reject);
                })
            } else {
                console.log("Spotify Accounts dir missing. Creating it now");
                fs.mkdir('data/accounts', (err) => {
                    if (err) reject(err);
                    else resolve({});
                })
            }
        });
    },
    getCurrentAccount: function () {
        return Spotify.listAccounts(true).then(function (accounts) {
            return new Promise((resolve, reject) => {
                fs.readFile("data/currentAccount.json", function (err, data) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    data = JSON.parse(data);

                    if ("undefined" !== typeof accounts[data]) {
                        resolve(accounts[data]);
                    } else {
                        reject(new Error("Invalid account selected"))
                    }
                })
            })
        });
    }
};

module.exports = Spotify;
