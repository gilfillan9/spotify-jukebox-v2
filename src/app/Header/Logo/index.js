import React from "react";
import styles from "./Logo.scss";
import {linkHandler} from "../../helpers";


const Logo = () => (
    <div className={styles.logo}>
        <a href="/" className={styles.link} onClick={linkHandler}>Jukebox</a>
    </div>
);

export default Logo;
