import React from "react";
import styles from "./CurrentTrack.scss";
import AlbumArt from "../../AlbumArt";
import {Link} from "react-router-dom";

class CurrentTrack extends React.Component {

    render() {
        if (this.props.track) {
            return (
                <div className={styles['current-track']}>
                    <Link to="/current">
                        <AlbumArt album={this.props.track.album} width={90}/>
                    </Link>

                    <div className={styles['info-wrap']}>
                        <span className={styles.title}>{this.props.track.name}</span>
                        <div className={styles['details-wrap']}>
                            <span className={styles.artists}>{this.props.track.artists.map((artist, index) => (
                                <Link to={"/artist/" + artist.id} key={artist.id + "-" + index}>{artist.name}</Link>
                            ))}</span>
                            <span className={styles.separator}>-</span>
                            <Link className={styles.album} to={"/album/" + this.props.track.album.id}>{this.props.track.album.name}</Link>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (<div className={styles['current-track']}>
                <Link to="/current">
                    <AlbumArt width={90}/>
                </Link>
            </div>);
        }
    }
}

export default CurrentTrack;
