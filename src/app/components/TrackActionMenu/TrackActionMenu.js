import React from "react";
import {IconMenu, MenuItem, MenuDivider} from "react-toolbox/lib/menu";
import Socket from "../../libs/Socket";
import {Link} from "react-router-dom";
import {withRouter} from "react-router-dom";


class TrackActionMenu extends React.Component {

    render() {
        const track = this.props.track;

        return (
            <IconMenu>
                <MenuItem caption="Add to Queue" icon="add" onClick={() => {
                    Socket.emit("addTrack", {track: track.uri, source: this.props.source})
                }}/>
                <MenuDivider />
                <MenuItem caption="View Artist" onClick={() => {
                    this.props.history.push("/artist/" + track.artists[0].id)
                }}><Link to={"/artist/" + track.artists[0].id}/></MenuItem>
                <MenuItem caption="View Album" onClick={() => {
                    this.props.history.push("/album/" + track.album.id)
                }}/>
            </IconMenu>
        )
    }
}

export default withRouter(TrackActionMenu);
