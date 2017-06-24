import React from "react";
import main from "./Main.scss";
import {Panel} from "react-toolbox/lib/layout";
import Spotify from "../libs/Spotify";
import TrackList from "../components/TrackList";
import {Button} from "react-toolbox/lib/button";
import Api from "../libs/Api";
import {objCompare} from "../libs/helpers";

class Album extends React.Component {
    state = {
        uri: "",
        album: null,
        artists: [],
        name: "",
        tracks: [],
        art: "",
        loading: true
    };


    shouldComponentUpdate(nextProps, nextState) {
        return this.props.match.params.album !== nextProps.match.params.album || !objCompare(nextState, this.state);
    }


    render() {
        return (
            <Panel className={main['page-raised']}>
                <div className={main['flex-container']}>
                    <div className={main.art} style={{background: "url(" + (this.state.art || "/images/svg/default-art.svg") + ") no-repeat center / cover"}}></div>
                    <div className={main.flex}>
                        <div className={main.header}>
                            <h5>{this.state.name}</h5>
                            <p>{this.state.tracks.length > 0 ? this.state.tracks.length + " Tracks" : ""}</p>
                            <Button disabled={this.state.loading} raised primary onClick={() => {
                                this.setState({loading: true});
                                Api.post('queue', {
                                    tracks: this.state.tracks.map((track) => track.uri),
                                    source: this.state.uri
                                }).then(() => {
                                    this.setState({loading: false});
                                }).catch((e) => {
                                    this.setState({loading: false});
                                    alert(e.message);
                                });
                            }}>Add to Queue</Button>
                            &nbsp;
                            <Button disabled={this.state.loading} raised onClick={() => {
                                this.setState({loading: true});
                                Api.delete('queue').then(() => {
                                    return Api.post('queue', {
                                        tracks: this.state.tracks.map((track) => track.uri),
                                        source: this.state.uri
                                    });
                                }).then(() => {
                                    this.setState({loading: false});
                                }).catch((e) => {
                                    this.setState({loading: false});
                                    alert(e.message);
                                });
                            }}>Replace Queue</Button>
                        </div>
                    </div>
                </div>

                <TrackList tracks={this.state.tracks} source={this.state.uri}/>
            </Panel>
        );
    }


    componentWillMount() {
        this.load();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.match.params.album !== nextProps.match.params.album) {
            this.setState({
                uri: "",
                album: null,
                artists: [],
                name: "",
                tracks: [],
                art: "",
                loading: true
            });
            this.load();
        }
    }

    load() {
        Spotify.load().then(() => {
            Spotify.getAlbum(this.props.match.params.album, {market: "GB"}).then((result) => {
                this.setState({
                    uri: result.uri,
                    name: result.name,
                    tracks: result.tracks.items.map((track) => {
                        track.album = result;
                        return track
                    }),
                    art: result.images.length > 0 ? result.images[0].url : '',
                    loading: result.tracks.total > result.tracks.items.length,
                }, () => {
                    if (result.tracks.total > result.tracks.items.length) {
                        this.loadMoreTracks();
                    }
                });
            });
        });
    }

    loadMoreTracks() {
        Spotify.load().then(() => {
            Spotify.getAlbumTracks(this.props.match.params.album, {
                offset: this.state.tracks.length,
                market: "GB"
            }).then((result) => {
                this.setState({
                    tracks: this.state.tracks.concat(result.items.map((track) => {
                        track.album = this.state.album;
                        return track
                    })),
                    loading: result.total > this.state.tracks.length + result.items.length,
                }, () => {
                    if (result.total > this.state.tracks.length) {
                        this.loadMoreTracks();
                    }
                });
            })
        })
    }
}

export default Album;
