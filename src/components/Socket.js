import io from 'socket.io-client';

// const ENDPOINT = 'https://xpense-server.herokuapp.com/';
const ENDPOINT = 'https://xpense-project-server.herokuapp.com/';
// const ENDPOINT = "localhost"

export const socket = io(ENDPOINT);