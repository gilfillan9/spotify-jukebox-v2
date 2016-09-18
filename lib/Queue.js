var App = require('./App');
// var Spotify = require('./Spotify');
var clone = require('clone');
var uuid = require('node-uuid')
var shuffle = require('shuffle-array');
var fs = require('fs');

var Queue = {
    queue: [],
    oldQueue: [],
    history: [],
    saveInterval: false,
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
            }
        }
        Queue.update();
    },
    addTrack: function (track, source, noUpdate) {
        track.uuid = uuid.v4();
        track.source = source;

        Queue.queue.push(track);

        if (Queue.isShuffled()) {
            Queue.shuffle();
        }
        noUpdate || Queue.update();

    },
    addTracks: function (tracks, source) {
        console.log(source)
        tracks.forEach(function (track) {
            Queue.addTrack(track, source, true);
        });
        Queue.update();
    },
    clear: function (noUpdate) {
        Queue.queue = [];

        noUpdate || Queue.update();
    },
    update: function () {
        var queue = Queue.serialise();
        // var diff = [];
        // if (diff.length == 0)return;
        //
        // if (queue.length == 0 || diff.length / queue.length > 0.5) {
        //     More than 50% of the elments have changed. Just send the whole queue
        if (queue != Queue.oldQueue) App.getIo().emit('queue', queue)
        // } else {
        //     App.getIo().emit('queueDiff', diff)
        // }

        Queue.oldQueue = queue;

        if (Queue.getCurrent() !== require('./Spotify').currentTrack) {
            require('./Spotify').playTrack(Queue.getCurrent()).then(() => App.updatePlayState());
        }
    },
    serialise: function (big) {
        if(big){
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
        if (shuffled == Queue.shuffled) return;
        Queue.shuffled = shuffled;

        if (Queue.shuffled) {
            Queue.shuffle();
            Queue.update();
        }
        if (!noUpdate) {
            App.updatePlayState();
        }
    },
    shuffle: function () {
        if (Queue.queue.length > 1) {
            var first = Queue.queue.shift();
            shuffle(Queue.queue);
            Queue.queue.unshift(first);
        }
    },
    reorder: function (uuids) {
        var tracks = {};
        Queue.queue.forEach((track) => tracks[track.uuid] = track);
        Queue.queue = uuids.map((uuid) => {
            const track = tracks[uuid]
            delete(tracks[uuid]);
            return track;
        });
        Object.keys(tracks).forEach((uuid) => {
            Queue.queue.push(tracks[uuid]);
        });
        Queue.update();
    },
    removeTrack: function (uuid) {
        Queue.queue = Queue.queue.filter((track) => track.uuid != uuid);
        // Queue.update();
        App.getIo().emit("removeTrack", uuid)
    },
    save: function () {
        return new Promise((resolve, reject) => {
            console.log("Saving Queue");
            fs.writeFile('data/queue.json', JSON.stringify(Queue.serialise()), (err) => {
                if (err) {
                    console.error("Couldn't save the queue", err)
                    reject(err);
                } else {
                    console.log("Queue Saved")
                    resolve();
                }
            })
        })
    },
    load: function () {
        console.log("Loading Queue");
        if (Queue.saveInterval) clearInterval(Queue.saveInterval)

        if (fs.existsSync("data/queue.json")) {
            fs.readFile("data/queue.json", function (err, text) {
                if (err) {
                    console.error("Couldn't save the queue", err)
                    return;
                }
                var data = JSON.parse(text);
                const Spotify = require('./Spotify');

                Promise.all(data.map((track) => Spotify.getTrack("spotify:track:" +track[0]).then((loadedTrack) => {
                    Queue.addTrack(loadedTrack, track[2], true);
                }))).then(() => {
                    Queue.update();
                    console.log("Queue Loaded");

                    Queue.saveInterval = setInterval(Queue.save, 60 * 5 * 1000); //Every 5 mins
                });
            });
        } else {
            console.log("No Queue file, continuing");
        }
    }
};

module.exports = Queue;
