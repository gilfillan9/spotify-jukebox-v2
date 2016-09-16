import React from "react";
import main from "../Main.scss";
import {Panel} from "react-toolbox/lib/layout";
import Spotify from "../../Spotify";
import TrackList from "../../TrackList";
import {Button} from "react-toolbox/lib/button";
import Socket from "../../Socket";


class Playlist extends React.Component {
    state = {
        name: "",
        description: "",
        tracks: [],
        art: ""
    }

    render() {
        return (
            <Panel className={main['page-raised']}>
                <div className={main['flex-container']}>
                    <div className={main.art} style={{background: "url(" + (this.state.art || "/images/svg/default-art.svg") + ") no-repeat center / cover"}}></div>
                    <div className={main.flex}>
                        <div className={main.header}>
                            <h5>{this.state.name}</h5>
                            <h6 dangerouslySetInnerHTML={{__html: this.state.description}}></h6>
                            <p>{this.state.tracks.length > 0 ? this.state.tracks.length + " Tracks" : ""}</p>
                            <Button raised primary onClick={() => {
                                Socket.emit("addTracks", this.state.tracks.map((track) => track.uri))
                            }}>Add to Queue</Button>
                            &nbsp;<Button raised onClick={() => {
                                Socket.emit("replaceTracks", this.state.tracks.map((track) => track.uri))
                            }}>Replace Queue</Button>
                        </div>
                    </div>
                </div>

                <TrackList tracks={this.state.tracks}/>
            </Panel>
        );
    }

    componentWillMount() {
        this.load();
    }

    componentWillReceiveProps() {
        this.setState({
            name: "",
            description: "",
            tracks: [],
            art: ""
        });
        this.load();
    }

    load() {
        Spotify.load().then(()=> {
            Spotify.getPlaylist(this.props.params.user, this.props.params.playlist).then((result) => {
                this.setState({
                    name: result.name,
                    description: result.description,
                    tracks: result.tracks.items.map((track) => track.track),
                    art: result.images.length > 0 ? result.images[0].url : ''
                });
                window.tracks = result.tracks.items.map((track) => track.track);

                if (result.tracks.total > result.tracks.items.length) {
                    this.loadMoreTracks();
                }
            });
        });
    }

    loadMoreTracks() {
        Spotify.load().then(()=> {
            Spotify.getPlaylistTracks(this.props.params.user, this.props.params.playlist, {
                offset: this.state.tracks.length
            }).then((result) => {
                if (result.total > result.items.length + this.state.tracks.length) {
                    this.loadMoreTracks();
                }
                this.setState({
                    tracks: this.state.tracks.concat(result.items.map((track) => track.track))
                });

            })
        })
    }
}

export default Playlist;
