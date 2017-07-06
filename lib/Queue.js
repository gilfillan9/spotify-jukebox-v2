const App = require('./App');
const clone = require('clone');
const uuid = require('uuid');
const shuffle = require('shuffle-array');
const fs = require('fs');

const Queue = {
    queue: [],
    oldQueue: [],
    history: [],
    saveInterval: -1,
    shuffled: true,
    getCurrent: function () {
        return Queue.queue.length > 0 ? Queue.queue[0] : null;
    },
    skip: function (direction) {
        if (direction > 0) {
            //Forward
            if (Queue.queue.length > 0) {
                Queue.history.push(Queue.queue.shift())
            }
        } else if (direction < 0) {
            //Back
            if (Queue.history.length > 0) {
                Queue.queue.unshift(Queue.history.pop())
            } else {
                // No history, so just seek to the start of the track
                require("./Spotify").seek(0);
            }
        }
        Queue.update();
    },
    addTrack: function (track, source, noUpdate) {
        if (track.availability !== 1) {
            console.log("Track unavailable, %s - %s", track.artists[0].name, track.name);
            //TODO send notification to connected clients
            return;
        }
        console.log("Added track %s - %s", track.artists[0].name, track.name);
        track.uuid = uuid.v4();
        track.source = source;

        Queue.queue.push(track);

        if (!noUpdate) {
            if (Queue.isShuffled()) {
                Queue.shuffle();
            }
            Queue.update();
        }
    },
    addTracks: function (tracks, source) {
        let wasEmpty = Queue.queue.length === 0;
        tracks.forEach(function (track) {
            Queue.addTrack(track, source, true);
        });
        Queue.shuffle(wasEmpty);
        Queue.update();
    },
    clear: function (noUpdate) {
        console.log("Clearing queue");
        Queue.queue = [];

        App.sendNotification("Play queue was cleared");
        noUpdate || Queue.update();
    },
    update: function () {
        let queue = Queue.serialise();
        // var diff = [];
        // if (diff.length == 0)return;
        //
        // if (queue.length == 0 || diff.length / queue.length > 0.5) {
        //     More than 50% of the elements have changed. Just send the whole queue
        if (queue !== Queue.oldQueue) App.getIo().emit('queue', queue);
        // } else {
        //     App.getIo().emit('queueDiff', diff)
        // }

        Queue.oldQueue = queue;

        if (Queue.getCurrent() !== require('./Spotify').currentTrack) {
            require('./Spotify').playTrack(Queue.getCurrent()).then(() => App.updatePlayState());
        }
    },
    serialise: function (big) {
        if (big) {
            return Queue.queue.map(Queue.serialiseTrack);
        } else {
            return Queue.queue.map(function (track) {
                return [track.link.split(":")[2], track.uuid, track.source]
            });
        }
    },
    serialiseTrack: function (track) {
        if (track === null) return null;
        return {
            id: track.link.split(":")[2],
            uuid: track.uuid,
            source: track.source
        };
    },
    isShuffled: function () {
        return Queue.shuffled;
    },
    setShuffled: function (shuffled, noUpdate) {
        if (shuffled === Queue.shuffled) return;
        Queue.shuffled = shuffled;

        if (Queue.shuffled) {
            Queue.shuffle();
            Queue.update();
        }
        if (!noUpdate) {
            App.updatePlayState();
        }
    },
    shuffle: function (fully = false) {
        if (Queue.queue.length > 1) {
            let first;
            if (!fully) {
                first = Queue.queue.shift();
            }
            shuffle(Queue.queue);
            if (!fully) {
                Queue.queue.unshift(first);
            }
        }
    },
    reorder: function (uuids) {
        let tracks = {};
        Queue.queue.forEach((track) => tracks[track.uuid] = track);
        Queue.queue = uuids.map((uuid) => {
            const track = tracks[uuid];
            delete(tracks[uuid]);
            return track;
        });
        Object.keys(tracks).forEach((uuid) => {
            Queue.queue.push(tracks[uuid]);
        });
        Queue.update();
    },
    removeTrack: function (uuid) {
        Queue.queue = Queue.queue.filter((track) => track.uuid !== uuid);
        // Queue.update();
        App.getIo().emit("removeTrack", uuid)
    },
    save: function () {
        return new Promise((resolve, reject) => {
            console.log("Saving Queue");
            fs.writeFile('data/queue.json', JSON.stringify(Queue.serialise()), (err) => {
                if (err) {
                    console.error("Couldn't save the queue", err);
                    App.sendNotification("Couldn't save the queue");
                    reject(err);
                } else {
                    console.log("Queue Saved");
                    App.sendNotification("Queue saved successfully");
                    resolve();
                }
            })
        })
    },
    load: function () {
        console.log("Loading Queue");
        if (Queue.saveInterval) clearInterval(Queue.saveInterval);

        if (fs.existsSync("data/queue.json")) {
            fs.readFile("data/queue.json", function (err, text) {
                if (err) {
                    console.error("Couldn't save the queue", err);
                    return;
                }
                let data = JSON.parse(text);
                const Spotify = require('./Spotify');

                // Don't shuffle the queue on load
                let shuffle = Queue.shuffled;
                Queue.shuffled = false;
                Promise.all(data.map((track) => Spotify.getTrack("spotify:track:" + track[0]).then((loadedTrack) => {
                    Queue.addTrack(loadedTrack, track[2], true);
                }))).then(() => {
                    // Restore previous shuffle state
                    Queue.shuffled = shuffle;

                    // Send the updated queue
                    Queue.update();
                    console.log("Queue Loaded");

                    Queue.saveInterval = setInterval(Queue.save, 60 * 5 * 1000); //Every 5 minutes
                });
            });
        } else {
            console.log("No Queue file, continuing");
        }
    }
};

module.exports = Queue;
