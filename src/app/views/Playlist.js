import React from "react";
import main from "./Main.scss";
import {Panel} from "react-toolbox/lib/layout";
import Spotify from "../libs/Spotify";
import {objCompare} from "../libs/helpers";
import TrackList from "../components/TrackList";
import {Button} from "react-toolbox/lib/button";
import Api from "../libs/Api";
import DurationTime from "duration-time-format";


class Playlist extends React.Component {
    state = {
        uri: "",
        name: "",
        description: "",
        tracks: [],
        art: "",
        loading: true
    };


    shouldComponentUpdate(nextProps, nextState) {
        return this.props.match.params.user !== nextProps.match.params.user || this.props.match.params.playlist !== nextProps.match.params.playlist || !objCompare(nextState, this.state);
    }

    render() {
        return (
            <Panel className={main['page-raised']}>
                <div className={main['flex-container']}>
                    <div className={main.art} style={{background: "url(" + (this.state.art || "/images/svg/default-art.svg") + ") no-repeat center / cover"}}/>
                    <div className={main.flex}>
                        <div className={main.header}>
                            <h5>{this.state.name}</h5>
                            <h6 dangerouslySetInnerHTML={{__html: this.state.description}}/>
                            <p>{this.state.tracks.length + " Tracks"}&nbsp; &bull; &nbsp;{DurationTime({
                                keepDecimals: 0,
                            }).format(this.state.tracks.map((track) => track.duration_ms / 1000).reduce((prev, next) => (prev + next), 0))}</p>
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

                <TrackList tracks={this.state.tracks} source={this.state.uri} includeDateAdded/>
            </Panel>
        );
    }

    componentWillMount() {
        this.load();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.match.params.user !== nextProps.match.params.user || this.props.match.params.playlist !== nextProps.match.params.playlist) {
            this.setState({
                uri: "",
                name: "",
                description: "",
                tracks: [],
                art: "",
                loading: true
            });
            this.load();
        }
    }

    load() {
        Spotify.load().then(() => {
            Spotify.getPlaylist(this.props.match.params.user, this.props.match.params.playlist, {market: "GB"}).then((result) => {
                this.setState({
                    uri: result.uri,
                    name: result.name,
                    description: result.description,
                    tracks: result.tracks.items.map((track) => Object.assign(track.track, {added_at: track.added_at})),
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
            Spotify.getPlaylistTracks(this.props.match.params.user, this.props.match.params.playlist, {
                offset: this.state.tracks.length,
                market: "GB"
            }).then((result) => {
                this.setState({
                    tracks: this.state.tracks.concat(result.items.map((track) => Object.assign(track.track, {added_at: track.added_at}))),
                    loading: result.total > this.state.tracks.length,
                }, () => {
                    if (result.total > this.state.tracks.length) {
                        this.loadMoreTracks();
                    }
                });
            })
        })
    }
}

export default Playlist;
