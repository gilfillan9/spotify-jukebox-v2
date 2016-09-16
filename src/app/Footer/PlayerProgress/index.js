import React from "react";
import {Slider} from "react-toolbox/lib/slider";
import styles from "./PlayerProgress.scss";
import {eventPassthrough} from "../../helpers";
import DurationTime from "duration-time-format";

class PlayerProgress extends React.Component {
    theme = {
        container: styles.container,
        progress: styles.progress,
        innerprogress: styles.innerprogress,
        knob: styles.knob
    }

    seek = eventPassthrough(this, 'onSeek');

    render() {
        if ("object" === typeof this.props.track && this.props.track !== null) {
            var duration = this.props.track.duration_ms / 1000;
            const time = DurationTime({
                keepDecimals: 0,
                colonNumber: duration > 3600 ? 2 : 1
            });

            return (
                <div className={styles['player-progress']}>
                    <Slider value={Math.max(0.001, this.props.progress)} max={duration} onChange={this.seek} theme={this.theme}/>

                    <span className={styles.label}>
                        {time.format(this.props.progress)} / {time.format(duration)}
                    </span>
                </div>
            )
        } else {
            return (
                <div className={styles['player-progress']}>
                    <Slider value={0.0001} max={1} onChange={() => {
                        return false;
                    }} disabled theme={this.theme}/>
                </div>
            )
        }
    }
}

export default PlayerProgress;
