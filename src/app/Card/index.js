import React from "react";
import {Card, CardMedia, CardTitle} from "react-toolbox/lib/card";
import styles from "./Card.scss";
import {Link} from "react-router";


class CardArt extends React.Component {
    state = {
        wide: false
    }

    render() {
        return (<CardMedia image={this.props.image} aspectRatio={this.state.wide ? "wide" : "square"}/>);
    }

    resize = () => {
        this.setState({
            wide: window.innerHeight < 600 || window.innerWidth < 600
        })
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.wide != nextState.wide;
    }

    componentWillMount() {
        window.addEventListener('resize', this.resize, false)

        this.resize();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize);
    }
}

class PlaylistCard extends React.Component {
    state = {
        wide: false
    };

    render() {
        return (
            <div className={styles['card-wrap']}>
                <Card className={styles.card}>
                    <Link to={"/playlist/" + this.props.playlist.owner.id + "/" + this.props.playlist.id}>
                        <CardArt image={this.props.playlist.images.length > 0 ? this.props.playlist.images[0].url : '/images/svg/default-art.svg'}/>
                        <CardTitle title={this.props.playlist.name} subtitle={this.props.playlist.tracks.total + " Tracks"} theme={styles}/>
                    </Link>
                </Card>
            </div>
        )
    }
}

class CategoryCard extends React.Component {
    render() {
        return (
            <div className={styles['card-wrap']}>
                <Card className={styles.card}>
                    <Link to={"/category/" + this.props.category.id}>
                        <CardArt image={this.props.category.icons.length > 0 ? this.props.category.icons[0].url : '/images/svg/default-art.svg'}/>
                        <CardTitle title={this.props.category.name} theme={styles}/>
                    </Link>
                </Card>
            </div>
        )
    }
}
class AlbumCard extends React.Component {
    render() {
        return (
            <div className={styles['card-wrap']}>
                <Card className={styles.card}>
                    <Link to={"/album/" + this.props.album.id}>
                        <CardArt image={this.props.album.images.length > 0 ? this.props.album.images[0].url : '/images/svg/default-art.svg'}/>
                        <CardTitle title={this.props.album.name} theme={styles}/>
                    </Link>
                </Card>
            </div>
        )
    }
}
class ArtistCard extends React.Component {
    render() {
        return (
            <div className={styles['card-wrap']}>
                <Card className={styles.card}>
                    <Link to={"/artist/" + this.props.artist.id}>
                        <CardArt image={this.props.artist.images.length > 0 ? this.props.artist.images[0].url : '/images/svg/default-art.svg'}/>
                        <CardTitle title={this.props.artist.name} theme={styles}/>
                    </Link>
                </Card>
            </div>
        )
    }
}

export {PlaylistCard, CategoryCard, AlbumCard, ArtistCard};
