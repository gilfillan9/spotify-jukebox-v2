import React from "react";

class Kiosk extends React.Component {

    render() {
        return (
            <div/>
        );
    }

    componentWillMount() {
        localStorage.setItem('kiosk', true);
        window.location.href = '/current';
    }

}

export default Kiosk;
