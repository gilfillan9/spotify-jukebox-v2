import React from "react";
import styles from "./UpNext.scss";
import AlbumArt from "../../components/AlbumArt";
import {Link} from "react-router-dom";

class UpNext extends React.Component {
    render() {
        return (
            <div className={styles['up-next']}>
                <h5>Up Next:</h5>
                <div className={styles.container}>
                    <AlbumArt album={this.props.track.album} height={80}/>
                    <div className={styles.details}>
                        <span className={styles.title}>{this.props.track.name}</span>
                        <div className={styles.artists}>{
                            this.props.track.artists.map((artist, i) => (
                                <Link key={i} to={'/artist/' + artist.id}>{artist.name}</Link>
                            ))
                        }</div>
                    </div>
                </div>
            </div>
        )
    }
}

export default UpNext;