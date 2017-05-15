import React from "react";
import Header from "./components/Header";
import View from "./views";
import Footer from "./components/Footer";
import PlayQueue from "./components/PlayQueue";
import Socket from "./libs/Socket";
import Spotify from "./libs/Spotify";
import Settings from "./components/Settings";
import {BrowserRouter, Switch, Route} from "react-router-dom";
import Kiosk from "./views/Kiosk";

class App extends React.Component {

    state = {
        playState: {
            playing: true,
            shuffled: false,
            phone: false
        },
        volume: 70,
        progress: 0,
        queue: [],
        queueRaw: [],
        connected: true,
        settings: false
    };

    onPlayStateChange(playSate) {
        this.setState({
            playState: playSate
        });
        Socket.emit("playState", playSate);
    }

    onVolumeChange(volume) {
        this.setState({
            volume: volume
        });
        Socket.emit("volume", volume);
    }

    onSeek = (progress) => {
        this.setState({
            progress: progress
        });
        Socket.emit("seek", progress)
    };


    componentWillMount() {
        if (Socket && Socket.on) {
            Socket.on("playState", (playState) => this.setState({playState: playState}));
            Socket.on("volume", (volume) => this.setState({volume: volume}));
            Socket.on("token", (token) => Spotify.setAccessToken(token));
            Socket.on("seek", (seek) => this.setState({progress: seek}));
            Socket.on("queue", (queue) => this.loadTracks(queue.map((item) => ({id: item[0], uuid: item[1], source: item[2]}))));
            Socket.on("removeTrack", (uuid) => this.setState({queue: this.state.queue.filter((track) => track.uuid != uuid)}));
        } else {
            //Shit's broken
            this.setState({
                connected: false
            });
            alert("Couldn't load the socket, please try again");
        }
    }

    /**
     * @param {int} direction negative for back, positive for forward
     */
    onSkip = (direction) => {
        if (direction > 0) {
            var queue = this.state.queue.concat();
            queue.shift();
            this.setState({
                queue: queue,
                progress: 0
            });
        } else {
            this.setState({
                progress: 0
            });
        }
        Socket.emit("skip", direction);
    };

    onRemoveTrack(uuid) {
        var queue = this.state.queue.filter((track) => track.uuid != uuid);

        this.setState({
            queue: queue
        });
        Socket.emit("removeTrack", uuid)
    }

    onReorder(order) {
        var tracks = {};
        this.state.queue.forEach((track) => tracks[track.uuid] = track);
        var queue = order.map((uuid) => tracks[uuid]);
        this.setState({
            queue: queue
        });
        Socket.emit("reorder", order)
    }

    loadTracks(queue) {
        this.state.queueRaw = queue;

        Spotify.getTracks(queue).then((tracks) => this.setState({
            queue: tracks
        }));
    }

    onSettingsClose() {
        this.setState({
            settings: false
        })
    }

    onSettingsOpen() {
        this.setState({
            settings: true
        })
    }

    render() {

        return (
            <BrowserRouter>
                <Switch>
                    <Route path="/kiosk">
                        <div>
                            <Kiosk queue={this.state.queue}/>
                            <Footer currentTrack={this.state.queue[0]}
                                    progress={this.state.progress}
                                    volume={this.state.volume}
                                    playState={this.state.playState}
                                    onPlayStateChange={this.onPlayStateChange.bind(this)}
                                    onVolumeChange={this.onVolumeChange.bind(this)}
                                    onSeek={this.onSeek.bind(this)}
                                    onSkip={this.onSkip.bind(this)}
                                    kioskMode={true}
                            />
                        </div>
                    </Route>
                    <Route path="/">
                        <div>
                            <Header onSettingsOpen={this.onSettingsOpen.bind(this)}/>
                            <View queue={this.state.queue}/>
                            <PlayQueue queue={this.state.queue}
                                       onRemoveTrack={this.onRemoveTrack.bind(this)}
                                       onReorder={this.onReorder.bind(this)}/>
                            <Footer currentTrack={this.state.queue[0]}
                                    progress={this.state.progress}
                                    volume={this.state.volume}
                                    playState={this.state.playState}
                                    onPlayStateChange={this.onPlayStateChange.bind(this)}
                                    onVolumeChange={this.onVolumeChange.bind(this)}
                                    onSeek={this.onSeek.bind(this)}
                                    onSkip={this.onSkip.bind(this)}
                            />
                            <Settings active={this.state.settings}
                                      onClose={this.onSettingsClose.bind(this)}/>
                        </div>
                    </Route>
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;
