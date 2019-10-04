import DurationTime from "duration-time-format";
import moment from "moment";
import React from "react";
import Sortable from "react-sortablejs";
import { List, ListDivider, ListItem } from "react-toolbox/lib/list";
import { arrayEquals, eventPassthrough } from "../../libs/helpers";
import State from "../../libs/State";
import styles from "./PlayQueue.scss";
import QueueItem from "./QueueItem";

class PlayQueue extends React.Component {
    onRemove = eventPassthrough(this, 'onRemoveTrack');
    onReorder = eventPassthrough(this, 'onReorder', (order) => {
        order.unshift(this.props.queue[0].uuid);
        return [order];
    });

    state = {
        scrolled: false,
    };

    onScroll() {
        const scrollTop = this._list.scrollTop;
        if (!this.state.scrolled && scrollTop > 0) {
            this.setState({
                scrolled: true,
            });
        } else if (this.state.scrolled && scrollTop === 0) {
            this.setState({
                scrolled: false,
            });
        }
    }

    render() {
        const listStyles = [styles.current];
        if (this.state.scrolled) {
            listStyles.push(styles.scrolled);
        }

        const playQueueStyles = [styles['play-queue']];

        if (State.kioskMode) {
            playQueueStyles.push(styles['kiosk-mode']);
        }

        let titleText = "Play queue";

        if (this.props.queue.length > 0) {
            let durationSeconds = this.props.queue.map((track) => track.duration_ms / 1000).reduce((prev, next) => (prev + next), 0);
            let progress = this.props.progress || 0;

            let durationFormatted = DurationTime({
                keepDecimals: 0,
            }).format(durationSeconds - progress);

            titleText += " - " + durationFormatted;

            let now = moment().add(durationSeconds, "second");

            titleText += " (" + now.format("h:mma") + ")"
        }

        const title = (
            <ListItem caption={titleText} className={State.kioskMode ? styles['kiosk-mode'] : ''} ripple={false} />
        );

        if (this.props.queue.length > 0) {
            const items = this.props.queue.filter((track) => {
                return track && track.id !== "4fK6E2UywZTJIa5kWnCD6x"; /* Friday Rebecca Black */
            }).map((track, index) => index === 0 ? undefined : (
                <QueueItem track={track} key={track.uuid} data-id={track.uuid} onRemove={this.onRemove} selected={false} />
            ));

            const currentItem = (<QueueItem track={this.props.queue[0]} onRemove={this.onRemove} selected />);

            return (
                <div className={playQueueStyles.join(" ")}>
                    <List className={listStyles.join(" ")}>
                        {title}
                        {currentItem}
                        <ListDivider/>
                    </List>
                    <div className={styles.tracks} onScroll={this.onScroll.bind(this)} ref={(el) => this._list = el}>
                        <List>
                            <Sortable onChange={this.onReorder}>
                                {items}
                            </Sortable>
                        </List>
                    </div>
                </div>
            );
        } else {
            return (
                <div className={playQueueStyles.join(" ")}>
                    <List className={listStyles.join(" ")}>
                        {title}
                    </List>
                </div>
            );
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState !== this.state || !arrayEquals(this.props.queue, nextProps.queue) || this.props.progress !== nextProps.progress;
    }
}

export default PlayQueue;
