import React from "react";
import {Panel} from "react-toolbox/lib/layout";
import main from "./Main.scss";
import {PlaylistCard, CategoryCard} from "../components/Card";
import Spotify from "../libs/Spotify";
import {objCompare} from "../libs/helpers";

class Browse extends React.Component {
    state = {
        message: "",
        playlists: [],
        categories: []
    };

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.location.key !== this.props.location.key || !objCompare(nextState, this.state);
    }

    render() {
        const playlists = this.state.playlists.map((playlist, index) => (<PlaylistCard playlist={playlist} key={index}/>));

        return (
            <Panel className={main.page}>
                <div className={main.header}>
                    <h5>Browse</h5>
                    <h6>{this.state.message}</h6>
                </div>
                <div className={main['card-list']}>
                    {playlists}
                </div>
                {this.renderCategories()}
            </Panel>
        );
    }

    renderCategories() {
        if (this.state.categories.length > 0) {
            const categories = this.state.categories.map((category, index) => (<CategoryCard category={category} key={index}/>));

            return (
                <div>
                    <div className={main.header}>
                        <h5>Categories</h5>
                    </div>
                    <div className={main['card-list']}>
                        {categories}
                    </div>
                </div>
            )
        }
    }

    componentWillMount() {
        Spotify.load().then(() => {
            Spotify.getFeaturedPlaylists({market: "GB"}).then((result) => this.setState({playlists: result.playlists.items, message: result.message}));
            Spotify.getCategories({market: "GB"}).then((result) => this.setState({categories: result.categories.items}))
        })
    }
}

export default Browse;
