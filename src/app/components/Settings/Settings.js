import React from "react";
import Dialog from "react-toolbox/lib/dialog";
import {eventPassthrough} from "../../libs/helpers";
import Socket from "../../libs/Socket";
import {Button} from "react-toolbox/lib/button";
import {ProgressBar} from "react-toolbox/lib/progress_bar";
import {Dropdown} from "react-toolbox/lib/dropdown";
import {Input} from "react-toolbox/lib/input";
import styles from "./Settings.scss";
import Api from "../../libs/Api";

class Settings extends React.Component {
    state = {
        active: false,
        accounts: [],
        activeAccount: false,

        name: "",
        username: "",
        password: "",
        loading: false
    };

    onClose = eventPassthrough(this, "onClose");

    onClear() {
        if (confirm("Are you sure you want to clear the queue?")) {
            this.setState({loading: true});
            Api.delete("queue").then(() => {
                this.setState({loading: false});
                //TODO show toast
            }).catch((e) => {
                this.setState({loading: false});
                alert(e.message)
            })
        }
    }

    onSave() {
        this.setState({loading: true});
        Api.post("queue/save").then(() => {
            //TODO show toast
            this.setState({loading: false});
        }).catch((e) => {
            this.setState({loading: false});
            alert(e.message)
        })
    }

    onKill() {
        if (confirm("Are you sure you want to restart the jukebox?"))
            Socket.emit("kill"); //TODO replace with an ajax call
    }

    switchAccount(id) {
        this.setState({loading: true});
        Api.post("settings/accounts/switch", {id: id}).then(() => {
            this.setState({loading: false});
        }).catch((e) => {
            this.setState({loading: false});
            alert(e.message)
        })
    }

    addAccount(e) {
        this.setState({loading: true});
        e.preventDefault();
        Api.post("settings/accounts", {
            id: this.state.name,
            username: this.state.username,
            password: this.state.password,
        }).then((data) => {
            this.setState({
                accounts: data.map((val) => ({
                    id: val.id,
                    value: val.id,
                    username: val.username,
                })),

                name: "",
                username: "",
                password: "",
                loading: false
            })
        }).catch((e) => {
            this.setState({loading: false});
            alert(e.message);
        })
    }

    onAccountChange(account) {
        this.setState({
            activeAccount: account.id
        })
    }

    boundAccountChange;

    componentWillMount() {
        this.boundAccountChange = this.onAccountChange.bind(this);
        Socket.on("accountChanged", this.boundAccountChange)
    }

    componentWillUnmount() {
        Socket.removeListener("accountChanged", this.boundAccountChange)
    }

    accountItem(item) {
        const containerStyle = {
            display: 'flex',
            flexDirection: 'column',
        };


        return (
            <div style={containerStyle}>
                <strong>{item.id}</strong>
                <small>{item.username}</small>
            </div>
        );
    }

    setStateMethod(name, value) {
        this.setState({
            [name]: value
        });
    }

    render() {
        if (this.state.loading) {
            return (
                <Dialog active={this.props.active}
                        onEscKeyDown={this.onClose}
                        onOverlayClick={this.onClose}
                        title='Settings'>
                    <ProgressBar type='circular' mode='indeterminate' multicolor/>
                </Dialog>
            )
        } else {

            const accounts = this.state.accounts.length > 0 ? (
                <div>
                    <Dropdown auto
                              source={this.state.accounts}
                              label='Switch Account'
                              onChange={this.switchAccount.bind(this)}
                              template={this.accountItem}
                              value={this.state.activeAccount}
                    />
                    <span style={{
                        height: 15,
                        display: "block"
                    }}/>
                </div>
            ) : undefined;

            return (
                <Dialog active={this.props.active}
                        onEscKeyDown={this.onClose}
                        onOverlayClick={this.onClose}
                        title='Settings'
                >
                    <Button onClick={this.onSave.bind(this)} raised primary theme={styles}>Save Queue</Button>
                    <Button onClick={this.onClear.bind(this)} raised accent theme={styles}>Clear Queue</Button>
                    <Button onClick={this.onKill.bind(this)} raised theme={styles}>Restart Jukebox</Button>

                    <span style={{
                        height: 15,
                        display: "block"
                    }}/>

                    {accounts}

                    <form onSubmit={this.addAccount.bind(this)}>
                        <h6>Add an Account</h6>

                        <Input type="text" label="Account Name" name='name' required value={this.state.name} onChange={this.setStateMethod.bind(this, 'name')}/>
                        <Input type="text" label="Spotify Username" name='username' required value={this.state.username} onChange={this.setStateMethod.bind(this, 'username')}/>
                        <Input type="password" label="Spotify Password" name='password' required value={this.state.password} onChange={this.setStateMethod.bind(this, 'password')}/>

                        <Button type="submit" icon='save'>Save</Button>
                    </form>
                </Dialog>
            )
        }
    }

    componentWillReceiveProps(newProps) {
        if (newProps.active && !this.state.active) {
            this.setState({
                accounts: [],
                name: "",
                username: "",
                password: "",
                loading: false
            });
            Api.get('settings').then((data) => {
                this.setState({
                    accounts: data.accounts.map((val) => ({
                        id: val.id,
                        value: val.id,
                        username: val.username
                    })),
                    activeAccount: data.activeAccount.id
                })
            }).catch((e) => {
                alert(e.message);
            });
        }

        this.setState({
            active: newProps.active
        })
    }
}

export default Settings;
