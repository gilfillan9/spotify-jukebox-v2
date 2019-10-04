import React from "react";
import styles from "./CurrentTrack.scss";
import AlbumArt from "../../AlbumArt";
import {Link} from "react-router-dom";
import State from "../../../libs/State";

export default ({track, hide}) => {
    if (hide) {
        return (
            <div className={styles['current-track'] + ' ' + (State.kioskMode ? styles['kiosk-mode'] : '')}/>
        )
    }
    return (
        <div className={styles['current-track'] + ' ' + (State.kioskMode ? styles['kiosk-mode'] : '')}>
            <Link to="/current">
                <AlbumArt album={track ? track.album : undefined} width={90}/>
            </Link>

            {track ? <div className={styles['info-wrap']}>
                <span className={styles.title}>{track.name}</span>
                <div className={styles['details-wrap']}>
                    <span className={styles.artists}>{track.artists instanceof Array ? track.artists.map((artist, index) => (
                        <Link to={"/artist/" + artist.id} key={artist.id + "-" + index}>{artist.name}</Link>
                    )) : undefined}</span>
                    <span className={styles.separator}>-</span>
                    {track.album ? <Link className={styles.album} to={"/album/" + track.album.id}>{track.album.name}</Link> : <span/>}
                </div>
            </div> : undefined}
        </div>
    )
};
