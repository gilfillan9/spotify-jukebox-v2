import React, {PropTypes} from "react";
import {Button} from "react-toolbox/lib/button";
import styles from "./PlayButton.scss";
import {eventPassthrough} from "../../../helpers";

class PlayButton extends React.Component {
    getIcon() {
        return this.props.playing ? '' : ''
    }

    onClick = eventPassthrough(this, 'onClick', () => !this.props.playing);

    render() {
        return (
            <Button icon={this.getIcon()} primary floating theme={styles} onClick={this.onClick.bind(this)}/>
        )
    }
}
export default PlayButton;
