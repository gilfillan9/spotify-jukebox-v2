import React from "react";
import {Button} from "react-toolbox/lib/button";
import styles from "./Controls.scss";
import PlayButton from "./PlayButton";
import {eventPassthrough} from "../../helpers";

class Controls extends React.Component {

    onSkip = eventPassthrough(this, 'onSkip');
    updatePlayState = eventPassthrough(this, 'onPlayStateChange', () => this.props.playState);

    onShuffleClicked() {
        this.props.playState.shuffled = !this.props.playState.shuffled;
        this.updatePlayState();
    };

    onPhoneClicked(on) {
        this.props.playState.phone = on;
        this.updatePlayState();
    };


    onPlayClicked(playing) {
        this.props.playState.playing = playing;
        this.updatePlayState();
    };


    render() {
        return (
            <div className={styles.controls}>
                <div className={styles.left}>
                    <Button icon="" floating theme={styles} mini accent={!this.props.playState.phone} onClick={this.onPhoneClicked.bind(this, false)} />
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
