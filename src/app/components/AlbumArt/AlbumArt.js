import React from 'react';

export default ({album, width, height, fill, ...others}) => {
    const styles = {
        background: "url(" + ((album && album.images.length > 0 && album.images[0].url) || '/images/svg/default-art.svg') + ") no-repeat center / cover"
    };
    if (fill) {
        styles.position = 'absolute';
        styles.top = styles.right = styles.bottom = styles.left = 0;
    } else {
        styles.width = width || height;
        styles.height = height || width;
    }

    return (
        <div style={styles} {...others}/>
    )
};
