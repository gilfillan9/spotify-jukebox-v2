import React from "react";
import {Route} from "react-router-dom";
import styles from "./Main.scss";
import Browse from "./Browse";
import Current from "./Current";
import Playlist from "./Playlist";
import Album from "./Album";
import Artist from "./Artist";
import Category from "./Category";
import Search from "./Search";
import {withRouter} from 'react-router'


class Main extends React.Component {
    render() {
        return (
            <main className={styles.main}>
                <Route path="/" exact component={Browse}/>
                <Route path="/current" render={() => <Current queue={this.props.queue}/>}/>
                <Route path="/playlist/:user/:playlist" component={Playlist}/>
                <Route path="/album/:album" component={Album}/>
                <Route path="/artist/:artist" component={Artist}/>
                <Route path="/category/:category" component={Category}/>
                <Route path="/search" component={Search}/>
            </main>
        );
    }


}

export default withRouter(Main);
