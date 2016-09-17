import React from "react";
import {IconMenu, MenuItem, MenuDivider} from "react-toolbox/lib/menu";
import {browserHistory} from "react-router";
import Socket from "../Socket";


class TrackActionMenu extends React.Component {

    render() {
        const track = this.props.track;

        return (
            <IconMenu>
                <MenuItem caption="Add to Queue" icon="add" onClick={()=> {
                    Socket.emit("addTrack", {track: track.uri, source: this.props.source})
                }}/>
                <MenuDivider />
                <MenuItem caption="View Artist" onClick={()=> {
                    browserHistory.push("/artist/" + track.artists[0].id)
                }}/>
                <MenuItem caption="View Album" onClick={()=> {
                    browserHistory.push("/album/" + track.album.id)
                }}/>
            </IconMenu>
        )
    }
}

export default TrackActionMenu;
