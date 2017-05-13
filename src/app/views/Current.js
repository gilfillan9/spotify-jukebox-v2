import React from "react";
import {objCompare} from "../libs/helpers";


class Current extends React.Component {
    render() {
        return (<div>CURRENT</div>);
    }


    shouldComponentUpdate(nextProps, nextState) {
        //TODO
        return nextProps.location.key !== this.props.location.key || !objCompare(nextState, this.state);
    }

}

export default Current;
