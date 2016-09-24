import React from "react";
import styles from "./PlayQueue.scss";
import QueueItem from "./QueueItem";
import {List, ListSubHeader, ListDivider} from "react-toolbox/lib/list";
import Sortable from "react-sortablejs";
import {eventPassthrough, arrayEquals} from "../../libs/helpers";


class PlayQueue extends React.Component {
    onRemove = eventPassthrough(this, 'onRemoveTrack');
    onReorder = eventPassthrough(this, 'onReorder', (order) => {
        order.unshift(this.props.queue[0].uuid);
        return [order]
    });

    state = {
        scrolled: false
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
        if (this.props.queue.length > 0) {
            const items = this.props.queue.map((track, index) => index == 0 ? undefined : (
                <QueueItem track={track} key={track.uuid} data-id={track.uuid} onRemove={this.onRemove} selected={false}/>
            ));

            const currentItem = (<QueueItem track={this.props.queue[0]} onRemove={this.onRemove} selected/>);

            return (
                <div className={styles['play-queue']}>
                    <List className={this.state.scrolled ? styles.currentScrolled : styles.current}>
                        <ListSubHeader caption='Play queue'/>
                        {currentItem}
                        <ListDivider />
                    </List>
                    <div className={styles.tracks} onScroll={this.onScroll.bind(this)} ref={(el) => this._list = el}>
                        <List>
                            <Sortable
                                onChange={this.onReorder}
                            >
                                {items}
                            </Sortable>
                        </List>
                    </div>
                </div>
            );
        } else {
            return (
                <div className={styles['play-queue']}>
                    <ListSubHeader caption='Play queue'/>
                </div>
            )
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.scrolled != this.state.scrolled || !arrayEquals(this.props.queue, nextProps.queue);
    }
}

export default PlayQueue;
