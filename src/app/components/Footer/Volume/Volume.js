import React from "react";
import styles from "./Volume.scss";
import {Slider} from "react-toolbox/lib/slider";
import {eventPassthrough} from "../../../libs/helpers";


class RightControls extends React.Component {
    onVolumeChange = eventPassthrough(this, 'onVolumeChange');

    render() {
        return (
            <div className={styles['volume-wrap']}>
                <Slider max={100} value={this.props.volume} className={styles.volume} step={1} editable onChange={this.onVolumeChange.bind(this)}/>
            </div>
        )
    }
}

export default RightControls;
