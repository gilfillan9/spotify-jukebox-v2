import React from "react";
import {objCompare} from "../../libs/helpers";
import styles from "./Current.scss";
import {Link} from "react-router-dom";
import UpNext from "./UpNext.js";
import Vibrant from "node-vibrant";

export default class Current extends React.Component {
    state = {
        styles: {
            background: undefined,
            opacity: 0
        },
        nextStyles: {
            background: undefined,
            opacity: 0
        }
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

    loadBackgroundColour(track) {
        let image = new Image();
        image.crossOrigin = "Anonymous";

        image.addEventListener('load', () => {
            let vibrant = new Vibrant(image);

            vibrant.getPalette().then((swatches) => {
                if (swatches.Vibrant) {
                    let rgb = swatches.Vibrant.getRgb().map(Math.round.bind(Math)).join(", ");
                    this.setBackground('radial-gradient(circle at center, rgb(' + rgb + ') 5vmin, rgba(' + rgb + ', 0.2) 80%, rgba(' + rgb + ', 0) 100%)')
                } else {
                    this.resetBackground();
                }
            }).catch((e) => {
                this.resetBackground();
            })
        });
        image.addEventListener('error', (e) => {
            this.resetBackground();
        })
        let url = track.album.images[0].url;
        if (url.indexOf("https://u.scdn.co") !== -1) url = url.replace("https://u.scdn.co/images/pl/default/", "https://i.scdn.co/image/");


        image.src = url;
    }

    setBackground(background) {
        this.setState({
            styles: {
                background: this.state.styles.background,
                opacity: 0
            },
            nextStyles: {
                background: background,
                opacity: 1
            }
        });
        setTimeout(() => {
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
                }
            });
            setTimeout(() => {
                this.setState({
                    styles: {
                        background: background,
                        opacity: 1
                    },
                    nextStyles: {
                        background: undefined,
                        opacity: 0
                    }
                })
            }, 200)
        }, 2000)
    }

    resetBackground() {
        this.setBackground(undefined);
    }
}