import React, { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from "../firebase/Auth";
import { addChat, getUser, getAllChats } from '../firebase/FirestoreFunctions';


let socket;

const Chat = () => {

    //user states
    const { currentUser } = useContext(AuthContext);
    const [user, setUser] = useState();
    //chat states
    const [message, setMessage] = useState('');
    const [allmsg, setAllmsg] = useState()
    const [emit, setEmit] = useState(undefined);
    const ENDPOINT = 'localhost:5000'

    useEffect(() => {

        socket = io(ENDPOINT);
        console.log(socket);
        console.log("ek baar")
        //venus part
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
        //vend
    }, [ENDPOINT]);

    // useEffect(()=>{
    //     socket.on('output',message=>{
    //         setAllmsg(allmsg=>[...allmsg,message]);
    //     })
    // },[]);

    useEffect(() => {
        socket.on('output', chatData => {

            console.log("emitEffect", user)
            var message = document.createElement('div');
            message.textContent = chatData.name + " : " + chatData.message;
            var messages = document.getElementById('messagesList')
            messages.appendChild(message);
            console.log("Message hau " + chatData);
        })
    }, [setEmit]);

    const sendMessage = async (event) => {
        event.preventDefault();
        if (message) {
            let chatData = { name: user.firstName, message: message }
            socket.emit('input', chatData, () => setMessage(''))
            setEmit(true);

            //venus part
            // async function addChat() {
            try {
                console.log("Chat send effect")
                //fetch user details from db
                await addChat(chatData);
                //setLoading(false)
                // setUser(u);
                // console.log("fetched user details")
            } catch (e) {
                console.log(e)
            }
            // }
            // addChat();
            //vend

        }

    }

    // console.log("dusra kuch" + message);
    return (
        <div>
            <h1>Chat component</h1>
            <h2>Is it?</h2>
            <div style={{border:'3px solid black', width:'100%'}}>
                <div className='cardMsg' style={{ width: "100% ", overflow: "auto", whiteSpace: "nowrap", height: '200px' }}>
                    <div id='messagesList' className='cardblock' style={{ display: "inline-block", width: '54%', height: '100px' }}>
                        {allmsg && allmsg.map((item) => {
                            return (
                                <div>{item.name} : {item.message}</div>
                            )
                        })}
                    </div>
                </div>
                {currentUser && currentUser ? (<div>
                    <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Enter message"
                        onKeyPress={event => event.key === 'Enter' ? sendMessage(event) : null}
                    />
                </div>) : (
                        <div>
                            <p>SignUp to comment!</p>
                        </div>
                    )}

            </div>
        </div>

    )
}

export default Chat;