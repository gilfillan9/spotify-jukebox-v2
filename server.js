const part = process.env.PART || "both";

// const internalIp = require('internal-ip');
const express = require('express');

const app = express();
const server = require('http').createServer(app);
const path = require('path');

if (!Object.values) {
    const values = require('object.values');
    values.shim();
}

console.log("Running part,", part)
if (part == "webpack" || part == "both") {

    if (process.env.NODE_ENV != 'production') {
        console.log("Initialising Webpack")
        const config = require('./webpack.config');
        const webpack = require('webpack');
        const compiler = webpack(config);
        const webpackDevMiddleware = require('webpack-dev-middleware');
        app.use(webpackDevMiddleware(compiler, {
            noInfo: true,
            publicPath: config.output.publicPath,
            silent: false,
            stats: {color: true}
        }));
    } else {
        console.log("Using prebuilt webpack");
        app.use(express.static(path.join(__dirname, './build/')));
    }
}

const port = process.env.PORT || 8080;

if (part == "server" || part == "both") {
    require("./lib/App")(app, server);
} else {
    //Dummy socket.io server to serve correct file
    var io = require('socket.io')(server);
}
if (part == "webpack" || part == "both") {
    app.use('/images', express.static(path.join(__dirname, './src/www/images/')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, './src/www/index.html'));
    });
}


server.listen(port, (err) => {
    if (err) {
        console.log(err);
        return;
    }

    console.log(' --------------------------------------');
    console.log(`    Local: http://127.0.0.1:${port}`);
    // console.log(` External: http://${ip}:${port}`);
    console.log(' --------------------------------------');
});
