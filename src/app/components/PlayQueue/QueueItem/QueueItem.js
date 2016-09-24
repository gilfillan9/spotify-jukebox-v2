import React from "react";
import {ListItem} from "react-toolbox/lib/list";
import AlbumArt from "../../AlbumArt";
import {Button} from "react-toolbox/lib/button";
import styles from "./QueueItem.scss";
import {eventPassthrough} from "../../../libs/helpers";


class QueueItem extends React.Component {
    render() {
        return (
            <div data-id={this.props['data-id']}>
                <ListItem
                    ripple={false}
                    caption={this.props.track.name}
                    avatar={(<AlbumArt album={this.props.track.album} fill/>)}
                    legend={this.props.track.artists.map((artist) => artist.name).join(", ")}
                    rightActions={this.props.selected ? [] : [
                        (<Button icon="" mini floating key="remove" onClick={this.remove.bind(this)} theme={styles}/>)
                    ]}
                    className={styles.item}
                    theme={styles}
                />
            </div>
        )
    }

    shouldComponentUpdate(nextProps) {
        return this.props.selected != nextProps.selected || this.props.track != nextProps.track;
    }

    remove = eventPassthrough(this, 'onRemove', () => this.props.track.uuid);
}

export default QueueItem;
