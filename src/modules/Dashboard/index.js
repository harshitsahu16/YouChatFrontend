import React, { useEffect, useRef, useState } from 'react';
import Avatar from '../../assets/av.jpg';
import Input from '../../components/Input';
import { io } from 'socket.io-client'; 
import Logo from '../../assets/ssss.jpg'
import MessagesAvatar from '../../assets/Avatar1.svg';
import PeopleAvatar from '../../assets/Avatar2.svg';
import ChatAvatar from '../../assets/Avatar3.png';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import PlusButton from '../../components/Icons/PlusButton';
import CrossButton from '../../components/Icons/CrossButton';
import Logout from '../../components/Icons/Logout';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "https://youchatbackend.onrender.com"


const capitalizeFirstLetter = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1);
};

const Dashboard = () => {

    const navigate = useNavigate();

    const [user,setUser] = useState(JSON.parse(localStorage.getItem('user:detail')))
    const [conversations,setConversations] = useState([]);
    const [messages,setMessages] = useState({});
    const [message,setMessage] = useState('');
    const [users,setUsers] = useState([]);
    const [socket,setSocket] = useState(null);
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [currentEmoji , setCurrentEmoji] = useState(null);

    const messageRef = useRef(null); 
    

    useEffect(() => {
        setSocket(io('https://youchatbackend.onrender.com/'));
    },[]);

    useEffect(() => {
        if(socket && user) {
            socket?.emit('addUser', user?.id);
            socket?.on('getUsers', users => {});
            socket?.on('getMessage', data => {
                setMessages(prev => {
                    if (prev.conversationId === data.conversationId) {
                        return {...prev, messages: [...prev.messages, { user: data.user, message: data.message }]};
                    } else {
                        // Handle case where new message belongs to a different conversation
                        const newConversation = conversations.find(conv => conv.conversationId === data.conversationId);
                        if (newConversation) {
                            fetchMessages(data.conversationId, newConversation.user);
                        } else {
                            setConversations([...conversations, { conversationId: data.conversationId, user: data.user }]);
                            fetchMessages(data.conversationId, data.user);
                        }
                        return prev;
                    }
                });
            });
            socket?.on('updateConversations', data => {
                const { conversationId, user } = data;
                setConversations(prevConversations => {
                    const conversationExists = prevConversations.find(conv => conv.conversationId === conversationId);
                    if (!conversationExists) {
                        return [...prevConversations, { conversationId, user }];
                    }
                    return prevConversations;
                });
            });
        }
    }, [socket]);

    useEffect(() => {
        messageRef?.current?.scrollIntoView({ behavior: 'smooth'})
    },[messages?.messages])

    useEffect(() => {
        if(user){
            const loggedInUser = JSON.parse(localStorage.getItem('user:detail'));
            const fetchConversations = async() => {
            const res = await fetch(`${BASE_URL}/api/conversations/${loggedInUser.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            const resData = await res.json();
            setConversations(resData);
        }
        fetchConversations();
        }
    },[user]);

    useEffect(() => {
        if(user){
            const fetchUsers = async() => {
                const res = await fetch(`${BASE_URL}/api/users/${user?.id}` , {
                    method: 'GET',
                    headers: {
                        'Content-Type' : 'application/json',
                    }
                });
                const resData = await res.json();
                setUsers(resData);
            }
            fetchUsers();
        }
    },[user]);

    const fetchMessages = async(conversationId, receiver) => {
        const res = await fetch(`${BASE_URL}/api/message/${conversationId}?senderId=${user?.id}&&receiverId=${receiver?.receiverId}` , {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const resData = await res.json()
        setMessages({messages: resData, receiver , conversationId});
    };

    const sendMessage = async (e) => {
        
    
        const senderId = user?.id;
        const receiverId = messages?.receiver?.receiverId;
        let conversationId = messages?.conversationId || 'new';
    
        try {
            socket?.emit('sendMessage', {
                senderId,
                receiverId,
                conversationId,
                message
            });
    
            const res = await fetch(`${BASE_URL}/api/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversationId,
                    senderId,
                    message,
                    receiverId
                })
            });
    
            if (res.ok) {
                const data = await res.json();
    
                if (conversationId === 'new') {
                    conversationId = data.conversationId;

                    setMessages(prevMessages => ({
                        ...prevMessages,
                        conversationId: data.conversationId
                    }));
                }
    
                setMessage('');
            } else {
                console.error('Error sending message:', await res.text());
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };
    

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };

    const addEmoji = (e) => {
        const sym = e.unified.split("_");
        const codeArray = [];
        sym.forEach((el) => codeArray.push("0x" + el));
        let emoji = String.fromCodePoint(...codeArray);
        setMessage(message + emoji);
    }

    const handleLogout = () => {
        localStorage.removeItem('user:detail');
        localStorage.removeItem('user:token');
        setUser(null);
        setConversations([]);
        setMessages({});
        setMessage('');
        setUsers([]);
        if (socket) {
            socket.disconnect(); 
        }
        navigate('/users/sign_in' , { replace: true});
    };
    
  return (
    <div className='w-screen flex h-screen'>
        <div className='w-[25%] h-full bg-secondary no-scrollbar overflow-y-auto'>
            <div className='flex items-center mx-10 my-6' >
                <div className='border border-black p-[1px] rounded-full'><img src={Avatar} alt="img" width={60} height={60} /></div>
                <div className='ml-6'>
                    <h3 className='text-2xl font-extrabold'>{capitalizeFirstLetter(user?.fullName)}</h3>
                    <p className='text-gray-600 text-lg font-medium'>My Account</p>
                </div>
                <div onClick={handleLogout} className='cursor-pointer ml-8 rounded-full'>
                    <Logout />
                </div>
            </div>

            <hr />
            <div className='mx-14 mt-4'>
                <div className=' text-primary text-3xl mb-2'>Messages</div>
                <div>
                    {
                      conversations.length > 0 ?
                        conversations.map(({conversationId , user}) => {
                            return(
                                <div> 
                                    <div className='flex items-center ml-[-6px] py-6 border-b border-b-gray-300' >
                                      <div className='flex items-center cursor-pointer' onClick={() => fetchMessages(conversationId, user)}>
                                      <div><img src={MessagesAvatar} alt="img" width={55} height={55} /></div>
                                        <div className='ml-6'>
                                         <h3 className='text-lg font-semibold'>{capitalizeFirstLetter(user?.fullName)}</h3>
                                         <p className='text-sm font-medium text-gray-600'>{user?.email}</p>
                                      </div>
                                      </div>
                                    </div> 
                                </div>
                            ) 
                        }) : <div className='ml-8 mt-20 p-4 text-xl font-bold text-gray-600'>No Conversations</div>
                    }
                </div>

            </div>
        </div>
        <div className='w-[50%] h-full bg-white flex flex-col items-center '>
            {
                messages?.receiver?.fullName &&
                <div className='w-[75%] bg-secondary h-[80px] my-8 rounded-full flex items-center px-14 py-2'>
               <div className='cursor-pointer border border-black p-[1px] rounded-full'><img src={ChatAvatar} alt="img" width={55} height={55} /></div>
               <div className='ml-4 mr-auto'>
                <h3 className='text-lg font-bold'>{capitalizeFirstLetter(messages?.receiver?.fullName)}</h3>
                <p className='text-sm font-light text-gray-600'>{messages?.receiver?.email}</p>
               </div>
               <div className='cursor-pointer'>
                 <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="black"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-phone-outgoing"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" /><path d="M15 9l5 -5" /><path d="M16 4l4 0l0 4" /></svg>
               </div>
            </div> 
            }
            <div className='flex-grow w-full overflow-y-scroll no-scrollbar shadow-sm'>
                <div className=' p-14'>
                    {
                        messages?.messages?.length > 0 ?
                        messages.messages.map(({message,user:{id} = {} }) => {
                            return (
                                <>
                                <div className={` p-5 max-w-[40%] rounded-b-xl mb-4 ${id === user?.id ? 'bg-primary text-white rounded-tl-xl ml-auto' : 'bg-secondary rounded-tr-xl'} `}>
                                       {capitalizeFirstLetter(message)}
                                </div>
                                <div ref={messageRef}>

                                </div>
                                </>
                                
                            )
                        }) : <div>
                            <div className='text-3xl font-bold text-primary flex items-center justify-center'>
                                <img className=' shadow-md rounded-2xl p-3 mt-[-32px]' src={Logo} width={350} height={300} alt="logo" />
                            </div>
                            <div className='text-center text-2xl font-bold mt-48'>No Messages or No Conversation Started.</div>
                            <div className='text-gray-600 text-center text-lg font-bold'>Click on any user to start Messaging...</div>
                        </div>
                        }
                </div>
            </div>
            {
                messages?.receiver?.fullName &&
                <div className='p-10 w-full flex items-center'>
                <Input onKeyDown={handleKeyPress} value={message} onChange={(e) => setMessage(e.target.value)} className='w-[75%]' inputClassName='p-4 border-0 shadow-md rounded-full bg-light focus:ring-0 focus:border-0 outline-none' placeholder='type a message...' />
                <div onClick={() => setIsPickerVisible(!isPickerVisible)} className={`ml-4 p-2 cursor-pointer bg-light rounded-full`}>
                 {isPickerVisible ? (<CrossButton />) : (<PlusButton />)}
                </div>
                {isPickerVisible && (
                            <div onClick={() => setIsPickerVisible(false)} className='absolute bottom-24 right-96'>
                                <Picker
                                    data={data}
                                    onEmojiSelect={addEmoji}
                                />
                            </div>
                        )}
                <div  onClick={() => sendMessage()} className={`ml-4 p-2 cursor-pointer bg-light rounded-full ${!message && 'pointer-events-none'}`}>
                  <svg  xmlns="http://www.w3.org/2000/svg"  width="30"  height="30"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-send"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 14l11 -11" /><path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" /></svg>
                </div>
               </div>
            }
            
        </div>
        <div className ='w-[25%] h-full bg-light px-8 py-12 no-scrollbar overflow-y-auto'>
          <div className=' text-primary text-3xl mb-4'>Peoples</div>
          <hr />
          <div>
                    {
                      users.length > 0 ?
                        users.map(({userId , user}) => {
                            return(
                                <div> 
                                    <div className='flex items-center  py-6 border-b border-b-gray-300' >
                                      <div className='flex items-center cursor-pointer' onClick={() => fetchMessages('new', user)}>
                                      <div><img src={PeopleAvatar} alt="img" width={55} height={55} /></div>
                                        <div className='ml-6'>
                                         <h3 className='text-lg font-semibold'>{capitalizeFirstLetter(user?.fullName)}</h3>
                                         <p className='text-sm font-medium text-gray-600'>{user?.email}</p>
                                      </div>
                                      </div>
                                    </div> 
                                </div>
                            ) 
                        }) : <div className='ml-8 mt-20 p-4 text-xl font-bold text-gray-600'>No Conversations</div>
                    }
                </div>
        </div>
    </div>
  )
}

export default Dashboard
