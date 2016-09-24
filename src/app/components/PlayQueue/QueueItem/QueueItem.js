import React from "react";
import {ListItem} from "react-toolbox/lib/list";
import {ListItemText} from "react-toolbox/lib/list/ListItemText";
import AlbumArt from "../../AlbumArt";
import {Button} from "react-toolbox/lib/button";
import styles from "./QueueItem.scss";
import {eventPassthrough, linkHandler} from "../../../libs/helpers";


class QueueItem extends React.Component {
    render() {
        const classes = [styles.item];
        if (this.props.large) {
            classes.push(styles.large);
        }

        return (
            <div data-id={this.props['data-id']} className={classes.join(" ")}>
                <ListItem
                    ripple={false}
                    avatar={(<AlbumArt album={this.props.track.album} fill/>)}
                    itemContent={(<div className={styles['content-wrap']}>
                        <ListItemText theme={styles} primary>{this.props.track.name}</ListItemText>
                        <ListItemText theme={styles} className={styles.artists}>{this.props.track.artists.map((artist, index) => (
                            <a href={"/artist/" + artist.id} key={artist.id + "-" + index} onClick={linkHandler}>{artist.name}</a>
                        ))}</ListItemText>
                    </div>)}
                    caption={this.props.track.name}
                    legend={this.props.track.artists.map((artist) => artist.name).join(", ")}
                    rightActions={this.props.selected ? [] : [
                        (<Button icon="" mini floating key="remove" onClick={this.remove.bind(this)} theme={styles}/>)
                    ]}
                    theme={styles}
                />
            </div>
        )
    }

    shouldComponentUpdate(nextProps) {
        return this.props.selected != nextProps.selected || this.props.track != nextProps.track || this.props.large != nextProps.large;
    }

    remove = eventPassthrough(this, 'onRemove', () => this.props.track.uuid);
}

export default QueueItem;
