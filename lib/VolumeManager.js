const App = require('./App');
const loudness = require('loudness');
const throttle = require("./throttle");

const throttledSetVolume = throttle((volume) => {
    VolumeManager._setVolume(volume);
    if (VolumeManager.isPhone()) {
        VolumeManager.volumes.phone = volume;
    } else {
        VolumeManager.volumes.normal = volume;
    }
}, 250)

const VolumeManager = {
    volumes: {
        normal: 70,
        phone: 50
    },
    phone: false,
    isPhone: function () {
        return VolumeManager.phone;
    },
    setPhone: function (isPhone, noUpdate) {
        if (isPhone === VolumeManager.isPhone()) return;

        VolumeManager.phone = isPhone;
        VolumeManager._setVolume(VolumeManager.getVolume());

        noUpdate || App.updatePlayState();
    },
    _setVolume: function (volume) {
        loudness.setVolume(VolumeManager.encodeVolume(parseInt(volume)), () => {
            App.getIo().emit('volume', volume);
        });
    },
    getVolume: function () {
        return VolumeManager.isPhone() ? VolumeManager.volumes.phone : VolumeManager.volumes.normal;
    },
    setVolume: (volume) => {
        App.getIo().emit('volume', volume);
        throttledSetVolume(volume);
    },
    serialise: function () {
        return {
            volumes: VolumeManager.volumes,
            phone: VolumeManager.phone,
            currentVolume: VolumeManager.getVolume()
        }
    },
    encodeVolume: function (volume) {
        // For use to set the actual volume
        return Math.pow(volume, 1 / 3) * 21.5;
    },
    decodeVolume: function (volume) {
        //For display on the site
        return Math.pow(volume / 21.5, 3)
    }
};

loudness.getVolume(function (err, volume) {
    if ("number" === typeof volume) {
        VolumeManager.volumes.normal = VolumeManager.decodeVolume(volume);
    }
});


module.exports = VolumeManager;
