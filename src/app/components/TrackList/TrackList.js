import React from "react";
import Table from "react-toolbox/lib/table/";
import {Link} from "react-router-dom";
import DurationTime from "duration-time-format";
import styles from "./TrackList.scss";
import AlbumArt from "../AlbumArt";
import Api from "../../libs/Api";
import TrackActionMenu from "../TrackActionMenu";
import moment from "moment";

const TrackModel = {
    title: {},
    duration: {},
    actions: {title: " "},
};
const TrackModelDate = Object.assign({}, TrackModel, {
    added_at: {title: "Added"}
});


const TrackModelFull = {
    image: {title: " "},
    title: {},
    actions: {title: " "},
    duration: {},
    artist: {},
    album: {},
};
const TrackModelDateFull = Object.assign({}, TrackModelFull, {
    added_at: {title: "Added"}
});

class TrackList extends React.Component {

    state = {
        full: false
    };

    onClickAlbum(track, source) {
        Api.post("queue", {tracks: [track], source: source}).catch((e) => alert(e.message));
    }

    render() {
        return (
            <Table className={styles.list} model={this.state.full ? (this.props.includeDateAdded ? TrackModelDateFull : TrackModelFull) : (this.props.includeDateAdded ? TrackModelDate : TrackModel)} source={this.props.tracks.map((track) => ({
                image: (<AlbumArt className={styles.art} album={track.album} fill onClick={this.onClickAlbum.bind(this, track.uri, this.props.source)}/>),
                title: track.name,
                duration: DurationTime({
                    keepDecimals: 0,
                    colonNumber: track.duration_ms / 1000 > 3600 ? 2 : 1
                }).format(track.duration_ms / 1000),
                artist: (
                    <div>{track.artists instanceof Array ? track.artists.map((artist, index) => (
                        <Link key={index} to={"/artist/" + artist.id} className={styles['link']}>{artist.name}</Link>
                    )) : undefined}</div>
                ),
                album: (
                    <Link to={"/album/" + track.album.id} className={styles['link']}>{track.album.name}</Link>
                ),
                actions: (<TrackActionMenu track={track}/>),
                added_at: moment(track.added_at).fromNow()
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

        if (this.state.full !== full) {
            this.setState({
                full: full
            })
        }
    }
}

export default TrackList;
