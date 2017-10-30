let state = {
    kioskMode: window.location.pathname === '/kiosk' || window.localStorage.getItem('kiosk') !== null
};

export default state;
