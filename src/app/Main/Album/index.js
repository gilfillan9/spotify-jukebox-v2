import React from "react";
import main from "../Main.scss";
import {Panel} from "react-toolbox/lib/layout";
import Spotify from "../../Spotify";
import TrackList from "../../TrackList";
import {Button} from "react-toolbox/lib/button";
import Socket from "../../Socket";

class Album extends React.Component {
    state = {
        uri: "",
        album: null,
        artists: [],
        name: "",
        tracks: [],
        art: ""
    };

    render() {
        return (
            <Panel className={main['page-raised']}>
                <div className={main['flex-container']}>
                    <div className={main.art} style={{background: "url(" + (this.state.art || "/images/svg/default-art.svg") + ") no-repeat center / cover"}}></div>
                    <div className={main.flex}>
                        <div className={main.header}>
                            <h5>{this.state.name}</h5>
                            <p>{this.state.tracks.length > 0 ? this.state.tracks.length + " Tracks" : ""}</p>
                            <Button raised primary onClick={() => {
                                Socket.emit("addTracks", {tracks: this.state.tracks.map((track) => track.uri), source: this.state.uri})
                            }}>Add to Queue</Button>
                            &nbsp;<Button raised onClick={() => {
                            Socket.emit("replaceTracks", {tracks: this.state.tracks.map((track) => track.uri), source: this.state.uri})
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

    componentWillReceiveProps() {
        this.setState({
            uri: "",
            album: null,
            artists: [],
            name: "",
            tracks: [],
            art: ""
        });
        this.load();
    }

    load() {
        Spotify.load().then(()=> {
            Spotify.getAlbum(this.props.params.album, {market: "GB"}).then((result) => {
                this.setState({
                    uri: result.uri,
                    name: result.name,
                    tracks: result.tracks.items.map((track) => {
                        track.album = result;
                        return track
                    }),
                    art: result.images.length > 0 ? result.images[0].url : ''
                });
                window.tracks = result.tracks.items;

                if (result.tracks.total > result.tracks.items.length) {
                    this.loadMoreTracks();
                }
            });
        });
    }

    loadMoreTracks() {
        Spotify.load().then(()=> {
            Spotify.getAlbumTracks(this.props.params.album, {
                offset: this.state.tracks,
                market: "GB"
            }).then((result) => {
                if (result.total > result.items.length + this.state.tracks.length) {
                    this.loadMoreTracks();
                }
                this.setState({
                    tracks: this.state.tracks.concat(result.items.map((track) => {
                        track.album = this.state.album;
                        return track
                    })),
                });

            })
        })
    }
}

export default Album;
