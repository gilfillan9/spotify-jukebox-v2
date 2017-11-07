let state = {
    kioskMode: window.localStorage.getItem('kiosk') !== null,
    rotate: window.localStorage.getItem('rotate') !== null
};

export default state;
