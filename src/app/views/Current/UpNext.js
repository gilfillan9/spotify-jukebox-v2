import React from "react";
import styles from "./UpNext.scss";
import AlbumArt from "../../components/AlbumArt";
import {Link} from "react-router-dom";
import {objCompare} from "../../libs/helpers";
import State from "../../libs/State";

class UpNext extends React.Component {

    render() {
        let progress = this.props.progress;
        let trackDuration = this.props.queue[0].duration_ms / 1000;
        let hide = this.props.idleMode && !((progress > 1 && 15 > progress) || (progress > trackDuration - 30 && trackDuration - 2 > progress));

        let track = this.props.queue[1];

        return (
            <div className={styles['up-next'] + ' ' + (State.kioskMode ? styles['kiosk-mode'] : '') + ' ' + (hide ? styles['idle-mode'] : '')}>
                <AlbumArt className={styles['album-art']} album={track.album} height={102}/>
                <div className={styles.details}>
                    <h5>Up Next</h5>
                    <span className={styles.title}>{track.name}</span>
                    <div className={styles.artists}>{
                        track.artists instanceof Array ? track.artists.map((artist, i) => (
                            <Link key={i} to={'/artist/' + artist.id}>{artist.name}</Link>
                        )) : undefined
                    }</div>
                </div>
            </div>
        )
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.progress !== nextProps.progress || this.props.idleMode !== nextProps.idleMode || !objCompare(this.props.queue[1], nextProps.queue[1]);
    }
}

export default UpNext;
