import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from "../firebase/Auth";
import { addChat, getUser, getAllChats } from '../firebase/FirestoreFunctions';
import { socket } from "./Socket";

//let socket;

const Chat = () => {

    //user states
    const { currentUser } = useContext(AuthContext);
    const [user, setUser] = useState();
    //chat states
    const [message, setMessage] = useState('');
    const [allmsg, setAllmsg] = useState()
    //const [emited, setEmited] = useState(false);
    const [msgSent, setMsgSent] = useState([]);
    // const ENDPOINT = 'localhost:5000'
    //let socket;

    useEffect(() => {

        // socket = io(ENDPOINT, { transports: ['websocket'], upgrade: false });

        async function getData() {

            try {
                console.log("enter use effect func")
                //fetch user details from db
                let u = await getUser(currentUser.uid);
                //setLoading(false)
                setUser(u);
                console.log("fetched user details", u);
            } catch (e) {
                console.log(e)
            }
            try {
                //fetch user details from db
                let data = await getAllChats();
                //setLoading(false)
                setAllmsg(data);
                console.log("fetched user details", data);
            } catch (e) {
                console.log(e)
            }
        }
        getData();

        async function outMsg() {
            socket.off('output').on('output', chatData => {

                setMsgSent(msgSent => [...msgSent, chatData]);
                var box = document.getElementById('messagesList');
                box.scrollTo(0, box.scrollHeight);
                // var message = document.createElement('div');
                // message.textContent = chatData.name + " : " + chatData.message;
                // var messages = document.getElementById('messagesList')
                // messages.appendChild(message);
                // console.log("Message hau " + chatData);
            })

        }
        outMsg();

        
    }, []);

    

    const sendMessage = async (event) => {
        event.preventDefault();
        if (message) {
            let chatData = { name: user.firstName, message: message }
            socket.emit('input', chatData, () => setMessage(''))

            try {
                console.log("Chat send effect")
                await addChat(chatData);

            } catch (e) {
                console.log(e)
            }

        }
    }

    return (
        <div>
            <div>
                <div className='cardMsg' style={{ width: "100% ", overflow: "auto", height: '25.0rem' }}>
                    <div id='messagesList' className='cardblock' style={{ display: "inline-block", width: '100%', height: '100px' }}>
                        {allmsg && allmsg.chatMessage.map((item) => {
                            return (
                                <div class="comments">
                                    <div class="comment chat">
                                        <span class="userName"> {item.name} </span>
                                        <br></br>
                                        {item.message}
                                    </div>
                                </div>
                            )
                        })}
                        {/* {msgSent ? (<div class="comments">
                            <div class="comment chat">
                                <span class="userName"> {msgSent.name} </span>
                                <br></br>
                                <span>{msgSent.message}</span>
                            </div>
                        </div>) : (null)} */}
                        {msgSent && msgSent.map((text) => {
                            return (
                                <div class="comments">
                                    <div class="comment chat">
                                        <span class="userName"> {text.name} </span>
                                        <br></br>
                                        {text.message}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                {currentUser && currentUser ? (<div className="chat-control">
                    <input className="form-control" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Enter message..."
                        onKeyPress={event => event.key === 'Enter' ? sendMessage(event) : null}
                    />
                    <button onClick={(event) => sendMessage(event)} class="commentButt" type="submit"><i class="fas fa-paper-plane icons"></i></button>
                </div>) : (
                        <div>
                            <p>SignUp to chat!</p>
                        </div>
                    )}

            </div>
        </div>

    )
}

export default Chat;