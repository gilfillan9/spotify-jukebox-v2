import React from "react";
import main from "./Main.scss";
import {Panel} from "react-toolbox/lib/layout";
import Spotify from "../libs/Spotify";
import {PlaylistCard} from "../components/Card";


class Category extends React.Component {
    state = {
        name: "",
        playlists: [],
        art: ""
    };

    render() {
        const playlists = this.state.playlists.map((playlist, index) => (<PlaylistCard playlist={playlist} key={index}/>));

        return (
            <div>
                <Panel className={main['page-raised']}>
                    <div className={main['flex-container']}>
                        <div className={main.art} style={{background: "url(" + (this.state.art || "/images/svg/default-art.svg") + ") no-repeat center / cover"}}></div>
                        <div className={main.flex}>
                            <div className={main.header}>
                                <h5>{this.state.name}</h5>
                            </div>
                        </div>
                    </div>

                </Panel>
                <Panel className={main.page}>
                    <div className={main['card-list']}>
                        {playlists}
                    </div>
                </Panel>
            </div>
        );
    }

    componentWillMount() {
        this.load();
    }

    componentWillReceiveProps() {
        this.setState({
            name: "",
            playlists: [],
            art: ""
        });
        this.load();
    }

    load() {
        Spotify.load().then(()=> {
            Spotify.getCategory(this.props.params.category, {country: "GB"}).then((result) => {
                this.setState({
                    name: result.name,
                    art: result.icons.length > 0 ? result.icons[0].url : ''
                });
            });
            this.loadMorePlaylists();
        });
    }

    loadMorePlaylists() {
        Spotify.load().then(()=> {
            Spotify.getCategoryPlaylists(this.props.params.category, {
                offset: this.state.playlists.length,
                country: "GB"
            }).then((result) => {
                if (result.playlists.total > result.playlists.items.length + this.state.playlists.length) {
                    this.loadMorePlaylists();
                }
                this.setState({
                    playlists: this.state.playlists.concat(result.playlists.items)
                });

            })
        })
    }
}

export default Category;
