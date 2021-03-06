import React from "react";
import main from "./Main.scss";
import {Panel} from "react-toolbox/lib/layout";
import Spotify from "../libs/Spotify";
import TrackList from "../components/TrackList";
import {AlbumCard, PlaylistCard, ArtistCard} from "../components/Card";
import {objCompare} from "../libs/helpers";
import queryString from "query-string";

class Search extends React.Component {
    state = {
        tracks: [],
        albums: [],
        playlists: [],
        artists: [],
    };

    shouldComponentUpdate(nextProps, nextState) {
        return queryString.parse(nextProps.location.search).query !== queryString.parse(this.props.location.search).query || !objCompare(nextState, this.state);
    }

    render() {
        const tracks = this.state.tracks.length > 0 ? (
            <div id="tracks">
                <div className={main.header}>
                    <h5>Tracks</h5>
                </div>
                <TrackList tracks={this.state.tracks}/>
            </div>
        ) : undefined;

        const albums = this.state.albums.length > 0 ? (
            <div id="albums">
                <div className={main.header}>
                    <h5>Albums</h5>
                </div>
                <div className={main['card-list']}>
                    {this.state.albums.map((album, index) => (<AlbumCard album={album} key={index}/>))}
                </div>
            </div>
        ) : undefined;

        const playlists = this.state.playlists.length > 0 ? (
            <div id="playlists">
                <div className={main.header}>
                    <h5>Playlists</h5>
                </div>
                <div className={main['card-list']}>
                    {this.state.playlists.map((playlist, index) => (<PlaylistCard playlist={playlist} key={index}/>))}
                </div>
            </div>
        ) : undefined;

        const artists = this.state.artists.length > 0 ? (
            <div id="artists">
                <div className={main.header}>
                    <h5>Artists</h5>
                </div>
                <div className={main['card-list']}>
                    {this.state.artists.map((artist, index) => (<ArtistCard artist={artist} key={index}/>))}
                </div>
            </div>
        ) : undefined;


        return (
            <div>
                <Panel className={main['page-raised']}>
                    <div className={main.header}>
                        <h5>You searched for: <strong>{queryString.parse(this.props.location.search).query}</strong></h5>
                    </div>
                    {tracks}
                </Panel>
                <Panel className={main['page']}>
                    {albums}
                    {playlists}
                    {artists}
                </Panel>
            </div>
        );
    }


    componentWillMount() {
        this.load(queryString.parse(this.props.location.search).query);
    }

    componentWillReceiveProps(nextProps) {
        if (queryString.parse(nextProps.location.search).query !== queryString.parse(this.props.location.search).query) {
            this.setState({
                tracks: [],
                albums: [],
                playlists: [],
                artists: []
            });
            this.load(queryString.parse(nextProps.location.search).query);
        }
    }

    load(query) {
        Spotify.load().then(()=> {
            Spotify.search(query, ["album", "artist", "playlist", "track"], {market: "GB"}).then((results) => {
                if (queryString.parse(this.props.location.search).query !== query) return;
                this.setState({
                    tracks: results.tracks.items,
                    albums: results.albums.items,
                    playlists: results.playlists.items,
                    artists: results.artists.items
                })
            })
        });
    }
}

export default Search;
