let socket;
try {
    socket = io(window.location.hostname + ":8080");
    window.socket = socket;
} catch (e) {
}
export default socket;
