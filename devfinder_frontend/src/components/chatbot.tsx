"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Bot, Send, Minimize2, Maximize2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi! I'm your coding assistant. I can help you with programming questions, code reviews, and development tips. How can I assist you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getBotResponse(inputMessage),
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes("hello") || input.includes("hi")) {
      return "Hello! Great to see you coding today. What programming challenge are you working on?";
    }
    if (input.includes("react") || input.includes("component")) {
      return "React is awesome! Are you working with functional components, hooks, or need help with state management? I can help with best practices and common patterns.";
    }
    if (input.includes("javascript") || input.includes("js")) {
      return "JavaScript is my forte! Whether it's ES6+ features, async/await, or debugging tips, I'm here to help. What specific JS topic interests you?";
    }
    if (input.includes("css") || input.includes("style")) {
      return "CSS can be tricky but fun! Are you working with flexbox, grid, animations, or responsive design? I can share some modern CSS techniques.";
    }
    if (input.includes("typescript") || input.includes("ts")) {
      return "TypeScript adds great type safety! Need help with interfaces, generics, or type definitions? I can guide you through TypeScript best practices.";
    }
    if (input.includes("error") || input.includes("bug")) {
      return "Debugging time! Can you share more details about the error? I can help you troubleshoot step by step. Remember to check the console and network tabs.";
    }
    if (input.includes("help") || input.includes("?")) {
      return "I'm here to help with all things coding! I can assist with React, JavaScript, TypeScript, CSS, debugging, code reviews, and best practices. What would you like to explore?";
    }
    
    return "That's an interesting question! While I'd love to give you a detailed answer, I'm focused on helping with coding and development topics. Could you tell me more about what you're building or what coding challenge you're facing?";
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center z-50"
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-14' : 'w-96 h-[500px]'
    }`}>
      <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden h-full flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Bot size={20} />
            <h3 className="font-semibold">Coding Assistant</h3>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 bg-gray-900 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.isBot ? '' : 'flex-row-reverse'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${
                      message.isBot 
                        ? 'bg-gradient-to-br from-purple-500 to-blue-600' 
                        : 'bg-gradient-to-br from-blue-500 to-green-500'
                    }`}>
                      {message.isBot ? <Bot size={16} /> : 'U'}
                    </div>
                    
                    <div className={`flex-1 max-w-xs ${message.isBot ? '' : 'text-right'}`}>
                      <div className={`flex items-baseline gap-2 mb-1 ${message.isBot ? '' : 'flex-row-reverse'}`}>
                        <span className={`font-semibold text-xs ${message.isBot ? 'text-purple-400' : 'text-blue-400'}`}>
                          {message.isBot ? 'Assistant' : 'You'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <div className={`inline-block px-4 py-2 rounded-2xl max-w-full break-words ${
                        message.isBot
                          ? 'bg-gray-700 border border-gray-600 text-gray-200 shadow-sm'
                          : 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg'
                      }`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
                      <Bot size={16} />
                    </div>
                    <div className="bg-gray-700 border border-gray-600 px-4 py-2 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 bg-gray-800 border-t border-gray-700 flex-shrink-0">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me about coding..."
                  disabled={isTyping}
                  className="flex-1 rounded-full border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isTyping}
                  className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 disabled:scale-100"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
