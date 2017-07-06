import React from "react"
import styles from "./Notifications.scss";

class Notification extends React.Component {
    render() {
        return (
            <div className={styles.notification} key={"notification"}>
                <div className={styles.text}>{this.props.text}</div>
                {this.props.actions ? <div className={styles.actions}>{this.props.actions}</div> : undefined}
            </div>
        );
    }
}

export default Notification;