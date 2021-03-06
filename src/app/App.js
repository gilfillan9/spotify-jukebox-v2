import React from "react";
import Header from "./components/Header";
import View from "./views";
import Footer from "./components/Footer";
import PlayQueue from "./components/PlayQueue";
import {Notifications, Notification} from "./components/Notifications";
import Socket from "./libs/Socket";
import Api from "./libs/Api";
import Spotify from "./libs/Spotify";
import Settings from "./components/Settings";
import {BrowserRouter, Switch, Route} from "react-router-dom";
import State from "./libs/State";

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
        connected: true,
        settings: false,
        idleMode: true,
        idleTimeout: null
    };

    componentWillMount() {
        if (Socket && Socket.on) {
            Socket.on("playState", (playState) => this.setState({playState: playState}));
            Socket.on("volume", (volume) => this.setState({volume: volume}));
            Socket.on("token", (token) => Spotify.setAccessToken(token));
            Socket.on("seek", (seek) => this.setState({progress: seek}));
            Socket.on("queue", (queue) => this.loadTracks(queue.map((item) => ({id: item[0], uuid: item[1], source: item[2]}))));
            Socket.on("removeTrack", (uuid) => this.setState({queue: this.state.queue.filter((track) => track.uuid !== uuid)}));
            Socket.on("notification", (notification) => {
                Notifications.add(<Notification {...notification} />)
            });


            let disconnectNotification;
            Socket.on('disconnect', function () {
                disconnectNotification = Notifications.add(<Notification text="Connection lost"/>);
            });
            Socket.on('reconnect', function () {
                if (disconnectNotification) {
                    Notifications.remove(disconnectNotification);
                }
            });
        } else {
            //Shit's broken
            this.setState({
                connected: false
            }, () => alert("Couldn't load the socket, please reload the page and try again"));
        }
    }

    onRemoveTrack(uuid) {
        let queue = this.state.queue.filter((track) => track.uuid !== uuid);

        this.setState({
            queue: queue
        });
        Api.delete('queue/' + uuid);
    }

    onReorder(order) {
        let tracks = {};
        this.state.queue.forEach((track) => tracks[track.uuid] = track);
        let queue = order.map((uuid) => tracks[uuid]);
        this.setState({
            queue: queue
        });
        Api.post("queue/order", {tracks: order})
    }

    loadTracks(queue) {
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
        });
    }

    updateIdle() {
        if (this.state.idleTimeout) clearTimeout(this.state.idleTimeout);
        if (this.state.kioskTimeout) clearTimeout(this.state.kioskTimeout);
        this.setState({
            idleMode: false,
            idleTimeout: setTimeout(this.startIdleMode.bind(this), 5000),
            kioskTimeout: setTimeout(this.resetKioskMode.bind(this), 30000),
        })
    }

    startIdleMode() {
        this.setState({
            idleMode: true,
            idleTimeout: null
        });
    }

    resetKioskMode() {
        return;
        if (!State.kioskMode) return;
        if (State.kioskMode && window.location.pathname !== '/current') {
            //TODO navigate to current page
            window.history.pushState({}, '', '/current');
        }
    }


    render() {


        let mainContent = (
            <div>
                <Header onSettingsOpen={this.onSettingsOpen.bind(this)}/>
                <View queue={this.state.queue} progress={this.state.progress}/>
                {!State.kioskMode ? <PlayQueue queue={this.state.queue} progress={this.state.progress}
                           onRemoveTrack={this.onRemoveTrack.bind(this)}
                           onReorder={this.onReorder.bind(this)}/> : undefined}
                <Footer currentTrack={this.state.queue[0]}
                        progress={this.state.progress}
                        volume={this.state.volume}
                        playState={this.state.playState}/>
                <Settings active={this.state.settings}
                          onClose={this.onSettingsClose.bind(this)}/>
            </div>
        );

        return (
            <BrowserRouter>
                <div onClick={this.updateIdle.bind(this)} onTouchMove={this.updateIdle.bind(this)} onMouseMove={this.updateIdle.bind(this)}>
                    <Notifications/>
                    {State.kioskMode ? (
                        <Switch>
                            <Route path='/current'>
                                <div>
                                    <View queue={this.state.queue} idleMode={this.state.idleMode} progress={this.state.progress} full={true}/>
                                    <Footer currentTrack={this.state.queue[0]}
                                            progress={this.state.progress}
                                            volume={this.state.volume}
                                            playState={this.state.playState}
                                            idleMode={this.state.idleMode}/>
                                </div>
                            </Route>
                            <Route path='/'>{mainContent}</Route>
                        </Switch>
                    ) : mainContent}
                </div>
            </BrowserRouter>
        );
    }
}

export default App;
