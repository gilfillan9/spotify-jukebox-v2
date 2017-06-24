import React from "react";
import {Button} from "react-toolbox/lib/button";
import styles from "./Controls.scss";
import PlayButton from "./PlayButton";
import Api from "../../../libs/Api";

class Controls extends React.Component {

    onSkip(direction) {
        if (direction > 0) {
            Api.post('queue/skip/forward');
        } else {
            Api.post('queue/skip/back');
        }
    }

    onShuffleClicked() {
        Api.post(this.props.playState.shuffled ? "player/shuffle/off" : "player/shuffle/on");
    };

    onPhoneClicked(on) {
        Api.post(on ? "volume/phone/on" : "volume/phone/off");
    };


    onPlayClicked(playing) {
        Api.post(playing ? "player/play" : "player/pause");
    };


    render() {
        return (
            <div className={styles.controls}>
                <div className={styles.left}>
                    <Button icon="" floating theme={styles} mini accent={!this.props.playState.phone} onClick={this.onPhoneClicked.bind(this, false)}/>
                    <Button icon="" floating theme={styles} mini accent={this.props.playState.phone} onClick={this.onPhoneClicked.bind(this, true)}/>
                </div>
                <div>
                    <Button icon='' floating theme={styles} mini onClick={this.onSkip.bind(this, -1)}/>
                    <PlayButton playing={this.props.playState.playing} onClick={this.onPlayClicked.bind(this)}/>
                    <Button icon='' floating theme={styles} mini onClick={this.onSkip.bind(this, 1)}/>
                </div>
                <div className={styles.right}>
                    <Button icon="" floating theme={styles} mini accent={this.props.playState.shuffled} onClick={this.onShuffleClicked.bind(this)}/>
                </div>
            </div>
        );
    }
}

export default Controls;
