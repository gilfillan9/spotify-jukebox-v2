import React, {PropTypes} from "react";
import {AppBar} from "react-toolbox/lib/app_bar";
import Logo from "./Logo";
import Search from "./Search";
import theme from "./Header.scss";
import {Button} from "react-toolbox/lib/button";
import {eventPassthrough} from "../helpers";


class TopBar extends React.Component {
    openSettings = eventPassthrough(this, "onSettingsOpen");

    render() {

        return (
            <AppBar theme={theme}>
                <Logo />
                <Search />
                <div className={theme.spacer}>
                    <Button icon="settings" onClick={this.openSettings} floating mini primary />
                </div>
            </AppBar>
        );
    }
}

export default TopBar;
