var App = require('./App');
var loudness = require('loudness');

function throttle(fn, threshhold, scope) {
    threshhold || (threshhold = 250);
    var last,
        deferTimer;
    return function () {
        var context = scope || this;

        var now = +new Date,
            args = arguments;
        if (last && now < last + threshhold) {
            // hold on to it
            clearTimeout(deferTimer);
            deferTimer = setTimeout(function () {
                last = now;
                fn.apply(context, args);
            }, threshhold);
        } else {
            last = now;
            fn.apply(context, args);
        }
    };
}

var VolumeManager = {
    volumes: {
        normal: 70,
        phone: 50
    },
    phone: false,
    isPhone: function () {
        return VolumeManager.phone;
    },
    setPhone: function (isPhone, noUpdate) {
        if (isPhone == VolumeManager.isPhone()) return;

        VolumeManager.phone = isPhone;
        VolumeManager._setVolume(VolumeManager.getVolume());

        noUpdate || App.updatePlayState();
    },
    _setVolume: function (volume) {
        loudness.setVolume(parseInt(volume), function (err) {
            App.getIo().emit('volume', volume);
        });
    },
    getVolume: function () {
        return VolumeManager.isPhone() ? VolumeManager.volumes.phone : VolumeManager.volumes.normal;
    },
    setVolume: throttle(function (volume) {
        VolumeManager._setVolume(volume);
        if (VolumeManager.isPhone()) {
            VolumeManager.volumes.phone = volume;
        } else {
            VolumeManager.volumes.normal = volume;
        }
    }, 250),
    serialise: function () {
        return {
            volumes: VolumeManager.volumes,
            phone: VolumeManager.phone,
            currentVolume: VolumeManager.getVolume()
        }
    },
    encodeVolume: function(volume){

    }
};

loudness.getVolume(function (err, volume) {
    if ("number" === typeof volume) {
        VolumeManager.volumes.normal = volume;
    }
})


module.exports = VolumeManager;
