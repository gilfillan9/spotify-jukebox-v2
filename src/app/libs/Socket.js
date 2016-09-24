import {Client} from "socket.io-reqres";

let socket, client;
try {
    socket = io(window.location.hostname + ":8080");
    window.socket = socket;
    client = new Client();
    client.setSocket(socket);
} catch (e) {
}
export default socket;
export {client as Client, socket as Socket};
