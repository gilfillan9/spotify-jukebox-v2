import React from "react";
import Current from "./Current";
import styles from"./Main.scss";

class Kiosk extends React.Component {
    render() {
        return (
            <main className={styles.main + ' ' + styles.kiosk}>
                <Current queue={this.props.queue} kioskMode={true} idleMode={this.props.idleMode} progress={this.props.progress}/>
            </main>
        );
    }
}

export default Kiosk;