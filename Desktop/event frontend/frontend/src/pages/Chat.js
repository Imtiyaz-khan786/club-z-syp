// Alternative simplified Chat.js that works without backend
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane, FaUsers, FaComments, FaBullhorn, FaQuestionCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [room, setRoom] = useState('general');
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const rooms = [
    { id: 'general', name: 'General', icon: FaUsers, description: 'General discussion', color: 'bg-blue-500' },
    { id: 'events', name: 'Events', icon: FaComments, description: 'Event discussions', color: 'bg-green-500' },
    { id: 'announcements', name: 'Announcements', icon: FaBullhorn, description: 'Official announcements', color: 'bg-purple-500' },
    { id: 'help', name: 'Help', icon: FaQuestionCircle, description: 'Get help and support', color: 'bg-orange-500' },
  ];

  // Load messages from localStorage when room changes
  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat_${room}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Mock data for first time
      const mockMessages = {
        general: [
          { id: 1, user: { id: 1, username: 'System' }, message: 'Welcome to General Chat!', created_at: new Date().toISOString() },
          { id: 2, user: { id: 2, username: 'Admin' }, message: 'Feel free to discuss anything here', created_at: new Date().toISOString() },
        ],
        events: [
          { id: 1, user: { id: 1, username: 'Event Coordinator' }, message: 'Tech Conference on Friday! Register now', created_at: new Date().toISOString() },
        ],
        announcements: [
          { id: 1, user: { id: 2, username: 'Admin' }, message: 'Exam schedule has been released', created_at: new Date().toISOString() },
        ],
        help: [
          { id: 1, user: { id: 3, username: 'Support' }, message: 'How can we help you today?', created_at: new Date().toISOString() },
        ],
      };
      const initialMessages = mockMessages[room] || [];
      setMessages(initialMessages);
      localStorage.setItem(`chat_${room}`, JSON.stringify(initialMessages));
    }
  }, [room]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_${room}`, JSON.stringify(messages));
    }
  }, [messages, room]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      user: { id: user?.id || 1, username: user?.username || 'You' },
      message: newMessage,
      created_at: new Date().toISOString()
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');
    toast.success('Message sent!');
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const currentRoom = rooms.find(r => r.id === room);
  const CurrentIcon = currentRoom?.icon || FaComments;

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Rooms Sidebar */}
      <div className="w-72 bg-white rounded-2xl shadow-lg overflow-hidden flex-shrink-0">
        <div className="bg-gradient-to-r from-primary to-secondary p-6">
          <div className="flex items-center space-x-2 text-white">
            <FaUsers className="text-xl" />
            <h2 className="text-xl font-bold">Chat Rooms</h2>
          </div>
          <p className="text-white opacity-80 text-sm mt-1">Join the conversation</p>
        </div>
        
        <div className="p-4 space-y-2">
          {rooms.map((r) => {
            const Icon = r.icon;
            const isActive = room === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setRoom(r.id)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-white bg-opacity-20' : r.color + ' bg-opacity-10'
                  }`}>
                    <Icon className={`text-lg ${isActive ? 'text-white' : r.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{r.name}</h3>
                    <p className={`text-xs ${isActive ? 'text-white opacity-80' : 'text-gray-500'}`}>
                      {r.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-gray-50 to-white border-b p-5">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentRoom?.color} bg-opacity-10`}>
              <CurrentIcon className={`text-2xl ${currentRoom?.color.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800"># {currentRoom?.name}</h2>
              <p className="text-sm text-gray-500">{currentRoom?.description}</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FaComments className="text-5xl mb-3" />
              <p className="text-lg">No messages yet</p>
              <p className="text-sm">Be the first to start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isOwnMessage = msg.user?.id === user?.id || msg.user?.username === user?.username;
              return (
                <div
                  key={idx}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    {!isOwnMessage && (
                      <div className="flex items-center space-x-2 mb-1 ml-2">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {msg.user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-xs font-semibold text-gray-600">
                          {msg.user?.username || 'Anonymous'}
                        </span>
                      </div>
                    )}
                    <div
                      className={`rounded-2xl p-3 ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-primary to-secondary text-white'
                          : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                      }`}
                    >
                      <p className="text-sm break-words">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isOwnMessage ? 'text-white opacity-70' : 'text-gray-400'}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="border-t p-4 bg-white">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message #${currentRoom?.name}...`}
              className="flex-1 input-field"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="btn-primary px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPaperPlane />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;