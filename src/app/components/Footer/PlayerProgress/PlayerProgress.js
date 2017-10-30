import React from "react";
import {Slider} from "react-toolbox/lib/slider";
import styles from "./PlayerProgress.scss";
import Api from "../../../libs/Api";
import DurationTime from "duration-time-format";
import State from "../../../libs/State";

class PlayerProgress extends React.Component {
    theme = {
        container: styles.container,
        progress: styles.progress,
        innerprogress: styles.innerprogress,
        knob: styles.knob
    };

    onSeek = (progress) => {
        Api.post("player/seek", {time: progress});
    };

    render() {
        let classes = styles['player-progress'] + ' ' + (State.kioskMode ? styles['kiosk-mode'] : '');
        if ("object" === typeof this.props.track && this.props.track !== null) {
            let duration = this.props.track.duration_ms / 1000;
            const time = DurationTime({
                keepDecimals: 0,
                colonNumber: duration > 3600 ? 2 : 1
            });

            let progress = "number" === typeof this.props.progress ? this.props.progress : 0;

            return (
                <div className={classes}>
                    <Slider value={Math.max(0.001, progress)} max={duration} onChange={this.onSeek} theme={this.theme}/>

                    <span className={styles.label}>
                        {time.format(progress)} / {time.format(duration)}
                    </span>
                </div>
            )
        } else {
            return (
                <div className={classes}>
                    <Slider value={0.0001} max={1} onChange={() => {
                        return false;
                    }} disabled theme={this.theme}/>
                </div>
            )
        }
    }
}

export default PlayerProgress;
