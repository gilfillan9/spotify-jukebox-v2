import React from "react";
import styles from "./Logo.scss";
import {Link} from "react-router-dom";

const Logo = () => (
    <div className={styles.logo}>
        <Link to="/" className={styles.link}>Jukebox</Link>
    </div>
);

export default Logo;
