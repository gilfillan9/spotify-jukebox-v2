import React from "react";
import styles from "./Volume.scss";
import {Slider} from "react-toolbox/lib/slider";
import Api from "../../../libs/Api";

class RightControls extends React.Component {
    onVolumeChange(volume) {
        Api.post('volume', {volume})
    }

    render() {
        return (
            <div className={styles['volume-wrap']}>
                <Slider max={100} value={this.props.volume} className={styles.volume} step={1} editable onChange={this.onVolumeChange.bind(this)}/>
            </div>
        )
    }
}

export default RightControls;
