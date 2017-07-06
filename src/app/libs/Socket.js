let socket;
try {
    socket = io();
    window.socket = socket;
} catch (e) {
}
export default socket;
