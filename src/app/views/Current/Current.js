import React from "react";
import {objCompare, getImageColour, increaseTextContrast} from "../../libs/helpers";
import styles from "./Current.scss";
import {Link} from "react-router-dom";
import UpNext from "./UpNext.js";

export default class Current extends React.Component {
    state = {
        background: undefined,
        lightMode: false,
    };

    render() {
        const queue = this.props.queue;

        if (queue.length === 0) {
            return (
                <div key={'main'} className={styles['current-page'] + ' ' + (this.props.kioskMode ? styles['kiosk-mode'] : '') + ' ' + (this.props.idleMode ? styles['idle-mode'] : '')} style={{background: this.state.background}}>
                    <div className={styles['background-gradient']}/>
                    <div className={styles['content-wrap']}>
                        <img src={this.props.kioskMode ? '/images/svg/default-art-dark.svg' : '/images/svg/default-art.svg'} className={styles['no-border']} style={{width: "50vmin"}}/>
                    </div>
                </div>
            );
        } else {
            const currentTrack = queue[0];
            return (
                <div key={'main'} className={styles['current-page'] + ' ' + (this.props.kioskMode ? styles['kiosk-mode'] : '') + ' ' + (this.props.idleMode ? styles['idle-mode'] : '')} style={{background: this.state.background}}>
                    <div className={styles['background-gradient']}/>
                    <div className={styles['content-wrap']}>
                        <img src={currentTrack.album.images.length > 0 ? currentTrack.album.images[0].url : '/images/svg/default-art.svg'} alt={currentTrack.name}/>
                        <div className={styles.details + ' ' + (this.state.lightMode ? styles.light : '')}>
                            <span className={styles.title}>{currentTrack.name}</span>
                            <div className={styles.artists}>{
                                currentTrack.artists instanceof Array ? currentTrack.artists.map((artist, i) => (
                                    <Link key={i} to={'/artist/' + artist.id}>{artist.name}</Link>
                                )) : undefined
                            }</div>
                        </div>
                    </div>

                    {this.props.queue.length > 1 ? <UpNext kioskMode={this.props.kioskMode} queue={this.props.queue} idleMode={this.props.idleMode} progress={this.props.progress}/> : undefined}
                </div>
            );
        }
    }


    shouldComponentUpdate(nextProps, nextState) {
        return this.props.progress !== nextProps.progress || this.props.idleMode !== nextProps.idleMode || this.state.background !== nextState.background || !objCompare(this.props.queue[0], nextProps.queue[0]) || !objCompare(this.props.queue[1], nextProps.queue[1]);
    }

    componentWillUpdate(nextProps, nextState) {
        if (!objCompare(this.props.queue[0], nextProps.queue[0])) {
            if (nextProps.queue.length > 0 && nextProps.queue[0].album.images.length > 0) {
                this.loadBackgroundColour(nextProps.queue[0]);
            } else {
                this.resetBackground();
            }
        }
    }

    componentWillMount() {
        if (this.props.queue.length > 0 && this.props.queue[0].album.images.length > 0) {
            this.loadBackgroundColour(this.props.queue[0]);
        } else {
            this.resetBackground();
        }
    }

    loadBackgroundColour(track) {
        let url = track.album.images[0].url;
        if (url === this._url) return;
        this._url = url;

        getImageColour(url).then((rgb) => {
            // this.setBackground()
            this.setBackground(rgb);

        }).catch(() => this.resetBackground());
    }

    setBackground(rgb) {
        this.setState({background: 'rgb(' + rgb.join(', ') + ')'});
    }

    resetBackground() {
        if (this.props.kioskMode) {
            this.setBackground([20, 20, 20]);
        } else {
            this.setBackground([175, 175, 175]);
        }
    }
}
