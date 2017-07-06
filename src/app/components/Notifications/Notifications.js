import React from "react"
import styles from "./Notifications.scss";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6
import uuid from "uuid";

class Notifications extends React.Component {

    state = {
        notifications: []
    };

    _add(notification) {
        notification = React.cloneElement(notification, {key: uuid.v4()})
        let notifications = this.state.notifications.slice()
        notifications.push(notification);
        this.setState({
            notifications: notifications
        });

        if ("number" === typeof notification.props.timeout) {
            setTimeout(() => this._remove(notification), notification.props.timeout);
        }

        return notification;
    }

    _remove(notification) {
        this.setState({
            notifications: this.state.notifications.filter((other) => other !== notification)
        });
    }

    componentWillMount() {
        Notifications.instance = this;
    }

    render() {
        return (
            <div className={styles.notifications}>
                <ReactCSSTransitionGroup
                    transitionName={styles}
                    transitionEnterTimeout={500}
                    transitionLeaveTimeout={500}
                    transitionAppearTimeout={500}
                    transitionAppear={true}>
                    {this.state.notifications}
                </ReactCSSTransitionGroup>
            </div>
        );
    }

    static add(notification) {
        return Notifications.instance._add(notification);
    }

    static remove(notification) {
        Notifications.instance._remove(notification);
    }
}

export default Notifications;