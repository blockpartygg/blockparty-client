import socketIO from 'socket.io-client';

class SocketIO {
    constructor() {}

    initialize() {
        let uri = process.env.NODE_ENV === 'production' ? 'https://blockparty-server.herokuapp.com:1337' : 'http://192.168.86.44:1337';
        this.socket = socketIO(uri);
        this.socket.on('connect_error', error => {
            console.log("SocketIO: Event: 'connect_error': error=");
            console.log(error);
        });
        this.socket.on('connect', () => {
            console.log("SocketIO: Event: 'connect': socket.id=" + this.socket.id);
        });
    }
}

io = new SocketIO();

export default io;