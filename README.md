# Spotify Jukebox
A jukebox made with the spotify API to use in our office so that everybody can contribute to the music being played.
It currently lives on a raspberry pi in our real life jukebox 

## Installing
This repository comes with the node modules compiled for the raspberry pi.

To change this just rename/delete the node_modules folder and run the command `npm install`.
You must then also download/compile the correct version of [node-spotify](http://www.node-spotify.com/)

Install [libspotify](https://developer.spotify.com/technologies/libspotify/) using [Mopidy's debian package](https://github.com/mopidy/libspotify-deb). libsoptify has been deprecated for a few years with the promise of an alternative being made almost yearly. 

## Configuration
Before using this you must first [create an application](https://developer.spotify.com/my-applications/#!/) with a spotify developer account. And download the api key (in binary format)

You must create a config file containing the information used to login to spotify and the settings for the http server. A default config is provided below.

```javascript
    {
        "spotify": {
            "apiKeyLocation": "./spotify_appkey.key",
            "clientId":      "<CHANGEME>",
            "clientSecret":   "<CHANGEME>"
        }
    }
```

## Usage
To start the jukebox just type `npm start` within the root folder. 

## License
[MIT](LICENSE.md)
