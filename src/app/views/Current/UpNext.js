import React from "react";
import styles from "./UpNext.scss";
import AlbumArt from "../../components/AlbumArt";
import {Link} from "react-router-dom";
import {objCompare, getImageColour} from "../../libs/helpers";

class UpNext extends React.Component {
    state = {
        background: undefined
    };

    render() {
        return (
            <div className={styles['up-next']}>
                <div className={styles.background} style={{background: this.state.background}}/>
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

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.background !== nextState.background || !objCompare(this.props.track, nextProps.track);
    }


    componentWillUpdate(nextProps, nextState) {
        if (!objCompare(this.props.track, nextProps.track)) {
            this.loadBackgroundColour(nextProps.track);
        }
    }

    componentWillMount() {
        if (this.props.track.album.images.length > 0) {
            this.loadBackgroundColour(this.props.track);
        }
    }


    loadBackgroundColour(track) {
        getImageColour(track.album.images[0].url).then((rgb) => {
            this.setState({background: 'radial-gradient(at bottom right, rgba(' + rgb + ', 0.4) 0%, rgba(' + rgb + ', 0.25) 40%, rgba(' + rgb + ', 0) 70%)'})
        }).catch(() => {
            this.setState({background: undefined})
        });
    }
}

export default UpNext;