import React from "react";
import styles from "./CurrentTrack.scss";
import AlbumArt from "../../AlbumArt";
import {linkHandler} from "../../helpers";

class CurrentTrack extends React.Component {

    render() {
        if (this.props.track) {
            return (
                <div className={styles['current-track']}>
                    <a href="/current"  onClick={linkHandler("/current")}>
                        <AlbumArt album={this.props.track.album} width={90}/>
                    </a>

                    <div className={styles['info-wrap']}>
                        <span className={styles.title}>{this.props.track.name}</span>
                        <div className={styles['details-wrap']}>
                            <span className={styles.artists}>{this.props.track.artists.map((artist, index) => (
                                <a href={"/artist/" + artist.id} key={artist.id + "-" + index} onClick={linkHandler}>{artist.name}</a>
                            ))}</span>
                            <span className={styles.seperator}>-</span>
                            <a className={styles.album} href={"/album/" + this.props.track.album.id} onClick={linkHandler}>{this.props.track.album.name}</a>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (<div className={styles['current-track']}>
                <a href="/current" onClick={linkHandler("/current")}>
                    <AlbumArt width={90}/>
                </a>
            </div>);
        }
    }
}

export default CurrentTrack;
