import React, { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiMinus } from 'react-icons/fi';
import { sendChatMessage } from '../services/api';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', content: "Hi! I'm EduBot, your AI learning assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isMinimized]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        
        const newMessages = [...messages, { role: 'user', content: userMsg }];
        setMessages(newMessages);
        setLoading(true);

        try {
            // Only send the last 5 messages as history to keep payload small
            const history = newMessages.slice(-5, -1);
            const res = await sendChatMessage({ message: userMsg, history });
            
            if (res.data.success) {
                setMessages([...newMessages, { role: 'bot', content: res.data.reply }]);
            } else {
                setMessages([...newMessages, { role: 'bot', content: "Sorry, I couldn't process that right now. Please try again." }]);
            }
        } catch (error) {
            const apiMsg = error?.response?.data?.message;
            const errorText = apiMsg || "Connection issue. Please check if XAMPP is running and try again.";
            setMessages([...newMessages, { role: 'bot', content: `⚠️ ${errorText}` }]);
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role !== 'student') return null;

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-transform hover:scale-110 z-50 flex items-center justify-center animate-bounce group"
            >
                <FiMessageSquare size={24} />
                <span className="absolute right-full mr-4 bg-white text-slate-800 text-sm font-bold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Ask EduBot
                </span>
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[500px]'}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl shrink-0 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <FiMessageSquare size={16} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm leading-tight">EduBot</h3>
                        <p className="text-xs text-blue-100">AI Learning Assistant</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                        <FiMinus size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); }} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                        <FiX size={16} />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            {!isMinimized && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-br-none' 
                                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                                }`}>
                                    {msg.role === 'bot' ? (
                                        <div className="prose prose-sm prose-slate max-w-none">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p>{msg.content}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3 shadow-sm flex gap-1">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-slate-100 rounded-b-2xl shrink-0">
                        <form onSubmit={handleSend} className="flex gap-2">
                            <input 
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..." 
                                className="flex-1 px-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 outline-none transition-all"
                            />
                            <button 
                                type="submit" 
                                disabled={!input.trim() || loading}
                                className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                            >
                                <FiSend size={16} className="-ml-0.5" />
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default Chatbot;
