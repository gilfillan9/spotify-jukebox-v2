import React from "react";
import styles from "./Main.scss";
import {Router, Route, browserHistory} from "react-router";
import Browse from "./Browse";
import Current from "./Current";
import Playlist from "./Playlist";
import Album from "./Album";
import Artist from "./Artist";
import Category from "./Category";
import Search from "./Search";

class Main extends React.Component {
    render() {
        return (
            <main className={styles.main}>
                <Router history={browserHistory}>
                    <Route path="/" component={Browse}/>
                    <Route path="/current" component={Current}/>
                    <Route path="/playlist/:user/:playlist" component={Playlist}/>
                    <Route path="/album/:album" component={Album}/>
                    <Route path="/artist/:artist" component={Artist}/>
                    <Route path="/category/:category" component={Category}/>
                    <Route path="/search" component={Search}/>
                </Router>
            </main>
        );
    }

    shouldComponentUpdate() {
        return false;
    }
}

export default Main;
