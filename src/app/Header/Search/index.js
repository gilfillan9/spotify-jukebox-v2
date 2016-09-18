import React from "react";
import styles from "./Search.scss";
import FontIcon from "react-toolbox/lib/font_icon";
import debounce from "debounce";
import {browserHistory} from "react-router";

class Search extends React.Component {

    state = {
        query: ""
    };

    debounced = debounce(this.onChange.bind(this), 500);

    onChange() {
        if (this.query != this._input.value) {
            this.setState({
                query: this._input.value
            });

            browserHistory.push("/search?query=" + encodeURIComponent(this._input.value));
        }
    }

    onKeyPress(e) {
        if (e.which == 13/*Enter*/) {
            this.debounced.clear();
            this.onChange();
        }
    }


    render() {
        return (
            <div className={styles.wrap}>
                <FontIcon value="search" className={styles.icon}/>

                <input className={styles.search} placeholder="Search" onChange={this.debounced} onKeyPress={this.onKeyPress.bind(this)} ref={(el) => this._input = el}/>
            </div>
        );
    }


}

export default Search;
