import DurationTime from "duration-time-format";
import React from "react";
import Sortable from "react-sortablejs";
import { Button } from "react-toolbox/lib/button";
import { List, ListDivider, ListItem } from "react-toolbox/lib/list";
import { arrayEquals, eventPassthrough } from "../../libs/helpers";
import State from "../../libs/State";
import styles from "./PlayQueue.scss";
import QueueItem from "./QueueItem";
import moment from "moment";

class PlayQueue extends React.Component {
    onRemove = eventPassthrough(this, 'onRemoveTrack');
    onReorder = eventPassthrough(this, 'onReorder', (order) => {
        order.unshift(this.props.queue[0].uuid);
        return [order]
    });

    state = {
        scrolled: false,
        open: false
    };

    onScroll() {
        const scrollTop = this._list.scrollTop;
        if (!this.state.scrolled && scrollTop > 0) {
            this.setState({
                scrolled: true
            })
        } else if (this.state.scrolled && scrollTop === 0) {
            this.setState({
                scrolled: false
            })
        }
    }

    render() {
        const listStyles = [styles.current];
        if (this.state.scrolled) {
            listStyles.push(styles.scrolled);
        }

        const playQueueStyles = [styles['play-queue']];
        if (this.state.open) {
            playQueueStyles.push(styles.open);
        }

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
            <ListItem caption={titleText} className={State.kioskMode ? styles['kiosk-mode'] : ''} ripple={false}
                leftActions={[
                    (
                        <Button mini floating onClick={() => this.setState({open: !this.state.open})} className={styles.button} icon={this.state.open ? "close" : "add"} key="open" />
                    ),
                ]} />
        );

        if (this.props.queue.length > 0) {
            const items = this.props.queue.map((track, index) => index === 0 ? undefined : (
                <QueueItem track={track} key={track.uuid} data-id={track.uuid} onRemove={this.onRemove} selected={false} large={this.state.open}/>
            ));

            const currentItem = (<QueueItem track={this.props.queue[0]} onRemove={this.onRemove} selected large={this.state.open}/>);

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
