import React from "react";
import {objCompare, getImageColour} from "../../libs/helpers";
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
        animating: false
    };

    render() {
        const queue = this.props.queue;

        if (queue.length === 0) {
            return (
                <div className={styles['current-page']}>
                    <div className={styles['content-wrap']}>
                        <img src='/images/svg/default-art.svg' style={{width: "50vmin"}}/>
                    </div>
                </div>
            );
        } else {
            const currentTrack = queue[0];
            return (
                <div key={'main'} className={styles['current-page']}>
                    <div className={styles.background} style={this.state.styles}/>
                    <div className={styles.background} style={this.state.nextStyles}/>
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

                    {this.props.queue.length > 1 ? <UpNext track={this.props.queue[1]}/> : undefined}
                </div>
            );
        }
    }


    shouldComponentUpdate(nextProps, nextState) {
        return !objCompare(this.state.styles, nextState.styles) || !objCompare(this.state.nextStyles, nextState.nextStyles) || !objCompare(this.props.queue[0], nextProps.queue[0]) || !objCompare(this.props.queue[1], nextProps.queue[1]);
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
        }
    }

    loadBackgroundColour(track) {
        getImageColour(track.album.images[0].url).then((rgb) => {
            this.setBackground('radial-gradient(circle at center, rgb(' + rgb + ') 5vmin, rgba(' + rgb + ', 0.2) 80%, rgba(' + rgb + ', 0) 100%)')

        }).catch(() => this.resetBackground());
    }

    setBackground(background) {
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
                animating: false
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
                }, 2000)
            });
        }
    }

    resetBackground() {
        this.setBackground(undefined);
    }
}