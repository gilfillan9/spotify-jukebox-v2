import React from "react";
import Table from "react-toolbox/lib/table/";
import {Link} from "react-router";
import DurationTime from "duration-time-format";
import styles from "./TrackList.scss";
import AlbumArt from "../AlbumArt";
import Socket from "../../libs/Socket";
import TrackActionMenu from "../TrackActionMenu";

const TrackModel = {
    title: {},
    duration: {},
    actions: {title: " "}
};

const TrackModelFull = {
    image: {title: " "},
    title: {},
    actions: {title: " "},
    duration: {},
    artist: {},
    album: {},
};

class TrackList extends React.Component {

    state = {
        full: false
    };

    onClickAlbum(track) {
        Socket.emit("addTrack", track)
    }


    render() {
        return (
            <Table className={styles.list} model={this.state.full ? TrackModelFull : TrackModel} source={this.props.tracks.map((track) => ({
                image: (<AlbumArt className={styles.art} album={track.album} fill onClick={this.onClickAlbum.bind(this, {track: track.uri, source: this.props.source})}/>),
                title: track.name,
                duration: DurationTime({
                    keepDecimals: 0,
                    colonNumber: track.duration_ms / 1000 > 3600 ? 2 : 1
                }).format(track.duration_ms / 1000),
                artist: (
                    <div>{track.artists.map((artist, index) => (
                        <Link key={index} to={"/artist/" + artist.id} className={styles['link']}>{artist.name}</Link>
                    ))}</div>
                ),
                album: (
                    <Link to={"/album/" + track.album.id} className={styles['link']}>{track.album.name}</Link>
                ),
                actions: (<TrackActionMenu track={track}/>)
            }))} selectable={false}/>
        )
    }

    componentWillMount() {
        this.boundResize = this.onResize.bind(this);
        window.addEventListener("resize", this.boundResize, false);
        this.onResize();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.boundResize)
    }


    onResize() {
        const full = window.innerWidth > 1200;

        if (this.state.full != full) {
            this.setState({
                full: full
            })
        }
    }
}

export default TrackList;