import React from "react";
import styles from "./PlayQueue.scss";
import QueueItem from "./QueueItem";
import {List, ListDivider, ListItem} from "react-toolbox/lib/list";
import {Button} from "react-toolbox/lib/button";
import Sortable from "react-sortablejs";
import {eventPassthrough, arrayEquals} from "../../libs/helpers";

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
        } else if (this.state.scrolled && scrollTop == 0) {
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
        const title = (<ListItem caption='Play queue' leftActions={[(<Button mini floating onClick={() => this.setState({open: !this.state.open})} className={styles.button} icon={this.state.open ? "close" : "add"} key="open"/>)]}/>);

        if (this.props.queue.length > 0) {
            const items = this.props.queue.map((track, index) => index == 0 ? undefined : (
                <QueueItem track={track} key={track.uuid} data-id={track.uuid} onRemove={this.onRemove} selected={false} large={this.state.open}/>
            ));

            const currentItem = (<QueueItem track={this.props.queue[0]} onRemove={this.onRemove} selected/>);

            return (
                <div className={playQueueStyles.join(" ")}>
                    <List className={listStyles.join(" ")}>
                        {title}
                        {currentItem}
                        <ListDivider />
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
            )
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState != this.state || !arrayEquals(this.props.queue, nextProps.queue);
    }
}

export default PlayQueue;
