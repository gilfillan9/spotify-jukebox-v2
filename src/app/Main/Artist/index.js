import React from "react";
import main from "../Main.scss";
import {Panel} from "react-toolbox/lib/layout";
import Spotify from "../../Spotify";
import TrackList from "../../TrackList";
import {AlbumCard} from "../../Card";


class Artist extends React.Component {
    state = {
        uri: "",
        albums: [],
        singles: [],
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
                        </div>
                    </div>
                </div>
                <div className={main.header}>
                    <h5>Top Tracks</h5>
                </div>
                <TrackList tracks={this.state.tracks} source={this.state.uri}/>

                {this.renderAlbumSection("Albums", this.state.albums)}
                {this.renderAlbumSection("Singles", this.state.singles)}
            </Panel>
        );
    }

    load() {
        Spotify.load().then(()=> {
            Spotify.getArtist(this.props.params.artist, {market: 'GB'}).then((result) => {
                this.setState({
                    uri: result.uri,
                    name: result.name,
                    art: result.images.length > 0 ? result.images[0].url : ''
                });
            });
            Spotify.getArtistTopTracks(this.props.params.artist, "GB").then((result) => {
                this.setState({
                    tracks: result.tracks
                });
            });
            this.loadMoreAlbums();
        });
    }

    componentWillMount() {
        this.load();
    }

    componentWillReceiveProps() {
        this.setState({
            uri: "",
            albums: [],
            singles: [],
            name: "",
            tracks: [],
            art: ""
        });
        this.load();
    }

    loadMoreAlbums() {
        Spotify.load().then(()=> {
            Spotify.getArtistAlbums(this.props.params.artist, {market: 'GB', offset: this.state.albums.length + this.state.singles.length, album_type: "album,single"}).then((result) => {
                if (result.total > this.state.albums.length + this.state.singles.length + result.items.length) {
                    this.loadMoreAlbums();
                }
                const albums = this.state.albums.concat();
                const singles = this.state.singles.concat();
                result.items.forEach((album) => {
                    if (album.album_type == "single") {
                        singles.push(album);
                    } else {
                        albums.push(album);
                    }
                });
                this.setState({
                    albums: albums,
                    singles: singles
                });

            });
        })
    }

    renderAlbumSection(title, albums) {
        if (albums.length > 0) {

            return (
                <div>
                    <div className={main.header}>
                        <h5>{title}</h5>
                    </div>
                    <div className={main['card-list']}>
                        {albums.map((album, index) => (<AlbumCard album={album} key={index}/>))}
                    </div>
                </div>
            )
        }
    }
}

export default Artist;
