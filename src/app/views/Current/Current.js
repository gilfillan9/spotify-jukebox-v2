import React from "react";
import {objCompare, getImageColour, increaseTextContrast} from "../../libs/helpers";
import styles from "./Current.scss";
import {Link} from "react-router-dom";
import UpNext from "./UpNext.js";

export default class Current extends React.Component {
    state = {
        styles: {
            background: undefined,
            opacity: 0
        },
        nextStyles: {
            background: undefined,
            opacity: 0
        },
        animating: false,
        lightMode: false,
    };

    render() {
        const queue = this.props.queue;

        if (queue.length === 0) {
            return (
                <div key={'main'} className={styles['current-page'] + ' ' + (this.props.kioskMode ? styles['kiosk-mode'] : '') + ' ' + (this.props.idleMode ? styles['idle-mode'] : '')}>
                    <div className={styles.background} style={this.state.styles}/>
                    <div className={styles.background} style={this.state.nextStyles}/>
                    <div className={styles['content-wrap']}>
                        <img src={this.props.kioskMode ? '/images/svg/default-art-dark.svg' : '/images/svg/default-art.svg'} className={styles['no-border']} style={{width: "50vmin"}}/>
                    </div>
                </div>
            );
        } else {
            const currentTrack = queue[0];
            return (
                <div key={'main'} className={styles['current-page'] + ' ' + (this.props.kioskMode ? styles['kiosk-mode'] : '') + ' ' + (this.props.idleMode ? styles['idle-mode'] : '')}>
                    <div className={styles.background} style={this.state.styles}/>
                    <div className={styles.background} style={this.state.nextStyles}/>
                    <div className={styles['content-wrap']}>
                        <img src={currentTrack.album.images.length > 0 ? currentTrack.album.images[0].url : '/images/svg/default-art.svg'} alt={currentTrack.name}/>
                        <div className={styles.details + ' ' + (this.state.lightMode ? styles.light : '')}>
                            <span className={styles.title}>{currentTrack.name}</span>
                            <div className={styles.artists}>{
                                currentTrack.artists.map((artist, i) => (
                                    <Link key={i} to={'/artist/' + artist.id}>{artist.name}</Link>
                                ))
                            }</div>
                        </div>
                    </div>

                    {this.props.queue.length > 1 ? <UpNext kioskMode={this.props.kioskMode} queue={this.props.queue} idleMode={this.props.idleMode} progress={this.props.progress}/> : undefined}
                </div>
            );
        }
    }


    shouldComponentUpdate(nextProps, nextState) {
        return this.props.progress !== nextProps.progress || this.props.idleMode !== nextProps.idleMode || !objCompare(this.state.styles, nextState.styles) || !objCompare(this.state.nextStyles, nextState.nextStyles) || !objCompare(this.props.queue[0], nextProps.queue[0]) || !objCompare(this.props.queue[1], nextProps.queue[1]);
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
        let rgbString = rgb.join(', ');
        let background = 'radial-gradient(circle at center, rgb(' + rgbString + ') 5vmin, rgba(' + rgbString + ', 0.3) 80%, rgba(' + rgbString + ', 0.1) 100%)';
        let lightMode = increaseTextContrast(rgb);

        if (this.state.animating) {
            clearTimeout(this.state.animating);
            this.setState({
                styles: {
                    background: background,
                    opacity: 1
                },
                nextStyles: {
                    background: undefined,
                    opacity: 0
                },
                animating: false,
                lightMode: lightMode,
            })
        } else {
            this.setState({
                styles: {
                    background: this.state.styles.background,
                    opacity: 0
                },
                nextStyles: {
                    background: background,
                    opacity: 1
                },
                lightMode: lightMode,
                animating: setTimeout(() => {
                    this.setState({
                        styles: {
                            background: background,
                            opacity: 1,
                            transition: 'none'
                        },
                        nextStyles: {
                            background: undefined,
                            opacity: 0,
                            transition: 'none'
                        },
                        animating: setTimeout(() => {
                            this.setState({
                                styles: {
                                    background: background,
                                    opacity: 1
                                },
                                nextStyles: {
                                    background: undefined,
                                    opacity: 0
                                },
                                animating: false
                            })
                        }, 200)
                    });
                }, 700)
            });
        }
    }

    resetBackground() {
        if(this.props.kioskMode) {
            this.setBackground([20, 20, 20]);
        } else {
            this.setBackground([175, 175, 175]);
        }
    }
}