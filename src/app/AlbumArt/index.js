import React from "react";

class AlbumArt extends React.Component {

    render() {
        var styles = {
            background: "url(" + ((this.props.album && this.props.album.images.length > 0 && this.props.album.images[0].url) || '/images/svg/default-art.svg') + ") no-repeat center / cover"
        };

        if (this.props.fill) {
            styles.position = 'absolute';
            styles.top = styles.right = styles.bottom = styles.left = 0;
        } else {
            styles.width = this.props.width || this.props.height;
            styles.height = this.props.height || this.props.width;
        }

        return (
            <div style={styles}/>
        )
    }
}

export default AlbumArt;
