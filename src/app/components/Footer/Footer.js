import React from "react";
import style from "./Footer.scss";
import PlayerProgress from "./PlayerProgress";
import Controls from "./Controls";
import Volume from "./Volume";
import CurrentTrack from "./CurrentTrack";
import State from "../../libs/State";

class Footer extends React.Component {

    render() {
        return (
            <footer className={style.footer + ' ' + (State.kioskMode ? style['kiosk-mode'] : '') + ' ' + (this.props.idleMode ? style['idle-mode'] : '')}>
                <PlayerProgress progress={this.props.progress} track={this.props.currentTrack} />
                <CurrentTrack track={this.props.currentTrack} />
                <Controls playState={this.props.playState} />
                <Volume shuffled={this.props.playState.shuffled} volume={this.props.volume}/>
            </footer>
        )
    }
}

export default Footer;
