import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaSearch, FaPaperPlane } from 'react-icons/fa';
import { API_BASE_URL } from '../../config';

const AIChat = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-advice.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage,
          context: {
            timestamp: new Date().toISOString(),
            // Add any additional context here
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, { type: 'ai', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { 
          type: 'error', 
          content: 'Sorry, I encountered an error. Please try again.' 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-md flex flex-col h-[600px]"
          >
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl">
              <div className="flex items-center space-x-2">
                <FaRobot className="text-xl" />
                <h3 className="font-semibold">Auto Parts Assistant</h3>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-light-surfaceAlt dark:bg-dark-surfaceAlt">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-light-textMuted dark:text-dark-textMuted">
                  <div className="text-center">
                    <FaRobot className="text-4xl mx-auto mb-4 text-blue-600" />
                    <p>Ask me anything about auto parts!</p>
                    <p className="text-sm mt-2">I can help you with:</p>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>• Part compatibility</li>
                      <li>• Maintenance advice</li>
                      <li>• Product recommendations</li>
                      <li>• Technical specifications</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : message.type === 'error'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-white dark:bg-dark-surface shadow-md'
                        }`}
                      >
                        {message.type === 'ai' && (
                          <div className="flex items-center space-x-2 mb-2">
                            <FaRobot className="text-blue-600" />
                            <span className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">Assistant</span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <div className="flex items-center space-x-2 text-light-textMuted dark:text-dark-textMuted">
                      <FaRobot className="text-blue-600" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white dark:bg-dark-surface">
              <div className="flex space-x-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about auto parts..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="2"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !input.trim() || isTyping
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIChat; 