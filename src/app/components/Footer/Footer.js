import React from "react";
import style from "./Footer.scss";
import PlayerProgress from "./PlayerProgress";
import Controls from "./Controls";
import Volume from "./Volume";
import CurrentTrack from "./CurrentTrack";
import {eventPassthrough} from "../../libs/helpers";

class Footer extends React.Component {
    onPlayStateChange = eventPassthrough(this, 'onPlayStateChange');
    onSeek = eventPassthrough(this, 'onSeek');
    onSkip = eventPassthrough(this, 'onSkip');
    onVolumeChange = eventPassthrough(this, 'onVolumeChange');


    render() {
        return (
            <footer className={style.footer}>
                <PlayerProgress progress={this.props.progress} track={this.props.currentTrack} onSeek={this.onSeek} kioskMode={this.props.kioskMode}/>
                <CurrentTrack track={this.props.currentTrack} kioskMode={this.props.kioskMode}/>
                <Controls playState={this.props.playState} onSkip={this.onSkip} onPlayStateChange={this.onPlayStateChange}/>
                <Volume shuffled={this.props.playState.shuffled} volume={this.props.volume} onVolumeChange={this.onVolumeChange.bind(this)}/>
            </footer>
        )
    }
}

export default Footer;
