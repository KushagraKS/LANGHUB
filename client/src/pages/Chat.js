import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import { FiSend, FiArrowLeft, FiUser } from 'react-icons/fi';

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchChat();
    fetchMessages();

    if (socket) {
      socket.emit('join_chat', chatId);

      socket.on('new_message', (data) => {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      });

      socket.on('user_typing', (data) => {
        if (data.userId !== user.id) {
          setTyping(true);
          setTypingUser(data.userName);
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setTyping(false);
            setTypingUser(null);
          }, 3000);
        }
      });

      socket.on('user_stopped_typing', () => {
        setTyping(false);
        setTypingUser(null);
      });

      return () => {
        socket.emit('leave_chat', chatId);
        socket.off('new_message');
        socket.off('user_typing');
        socket.off('user_stopped_typing');
      };
    }
  }, [chatId, socket, user.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChat = async () => {
    try {
      const response = await api.get(`/chats/${chatId}`);
      setChat(response.data);
    } catch (error) {
      console.error('Error fetching chat:', error);
      navigate('/dashboard');
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chats/${chatId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('send_message', {
      chatId,
      content: newMessage,
      messageType: 'text'
    });

    socket.emit('stop_typing', { chatId });
    setNewMessage('');
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (socket) {
      socket.emit('typing', { chatId });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { chatId });
      }, 1000);
    }
  };

  if (!chat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const partner = chat.participants.find(p => p._id !== user.id);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-6xl mx-auto">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-3 flex-1">
            {partner.avatar ? (
              <img className="h-10 w-10 rounded-full" src={partner.avatar} alt={partner.name} />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <FiUser className="h-5 w-5 text-primary-600" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{partner.name}</h2>
              <p className="text-sm text-gray-500">
                {chat.languagePair.native} ↔ {chat.languagePair.learning}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwn = message.sender._id === user.id;
            return (
              <div
                key={message._id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-2 max-w-xs md:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!isOwn && (
                    <div className="flex-shrink-0">
                      {message.sender.avatar ? (
                        <img className="h-8 w-8 rounded-full" src={message.sender.avatar} alt={message.sender.name} />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <FiUser className="h-4 w-4 text-primary-600" />
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    {!isOwn && (
                      <p className="text-xs text-gray-500 mb-1">{message.sender.name}</p>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isOwn
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          {typing && typingUser && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
                <p className="text-sm text-gray-500 italic">{typingUser} is typing...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <FiSend className="h-5 w-5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;

