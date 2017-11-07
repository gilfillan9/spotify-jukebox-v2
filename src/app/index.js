import "./theme/base.scss";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App.js";
import State from "./libs/State"

ReactDOM.render(<App/>, document.getElementById('app'));

if (State.kioskMode) {
    document.getElementsByTagName('body')[0].style.backgroundColor = '#000';
    document.getElementById('app').className += ' kiosk-mode';
}
if (State.rotate) {
    document.getElementById('app').className += ' rotate';
}
