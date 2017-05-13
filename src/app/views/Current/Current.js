import React from "react";
import {objCompare} from "../../libs/helpers";
import styles from "./Current.scss";
import {Link} from "react-router-dom";

export default class Current extends React.Component {
    render() {
        const queue = this.props.queue;
        if (queue.length === 0) {
            return (
                <div>None</div>
            );
        } else {
            const currentTrack = queue[0];
            return (
                <div className={styles['current-page']}>
                    <div className={styles['content-wrap']}>
                        <img src={currentTrack.album.images.length > 0 ? currentTrack.album.images[0].url : '/images/svg/default-art.svg'} alt={currentTrack.name}/>
                        <div className={styles.details}>
                            <span className={styles.title}>{currentTrack.name}</span>
                            <div className={styles.artists}>{
                                currentTrack.artists.map((artist, i) => (
                                    <Link key={i} to={'/artist/' + artist.id}>{artist.name}</Link>
                                ))
                            }</div>
                        </div>
                    </div>
                </div>
            );
        }
    }


    shouldComponentUpdate(nextProps, nextState) {
        return !objCompare(this.props.queue[0], nextProps.queue[0]);
    }

}