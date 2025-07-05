"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Minimize2, Maximize2, Send } from "lucide-react";
import { Bot, Users } from "lucide-react";

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_name: string;
  user_image?: string;
}

interface ChatProps {
  roomId: string;
}

export function RoomChat({ roomId }: ChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages
  const fetchMessages = async (showNotification = false) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/rooms/${roomId}/messages`
      );
      if (response.ok) {
        const newMessages = await response.json();
        
        // Check for new messages
        if (showNotification && newMessages.length > 0) {
          const latestMessage = newMessages[newMessages.length - 1];
          if (lastMessageId && latestMessage.id !== lastMessageId) {
            // New message detected
            if (!isTabVisible && latestMessage.user_id !== session?.user?.id) {
              setUnreadCount(prev => prev + 1);
              showNotificationToUser(latestMessage);
            }
          }
          setLastMessageId(latestMessage.id);
        } else if (newMessages.length > 0) {
          setLastMessageId(newMessages[newMessages.length - 1].id);
        }
        
        setMessages(newMessages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show browser notification for new messages
  const showNotificationToUser = (message: Message) => {
    if (Notification.permission === "granted") {
      new Notification(`New message from ${message.user_name}`, {
        body: message.content,
        icon: message.user_image || "/icon.png",
        tag: `room-${roomId}`,
      });
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user?.id || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/rooms/${roomId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: newMessage.trim(),
            userId: session.user.id,
          }),
        }
      );

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages((prev) => [...prev, sentMessage]);
        setNewMessage("");
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (roomId) {
      fetchMessages();
      requestNotificationPermission();
    }
  }, [roomId]);

  // Auto-refresh messages every 3 seconds
  useEffect(() => {
    if (!roomId) return;
    
    const interval = setInterval(() => {
      fetchMessages(true); // Enable notifications for auto-refresh
    }, 3000);

    return () => clearInterval(interval);
  }, [roomId, lastMessageId, isTabVisible]);

  // Track tab visibility for notifications
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
      if (!document.hidden) {
        setUnreadCount(0); // Reset unread count when tab becomes visible
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center z-50"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center z-50"
      >
        <div className="relative">
          <MessageCircle size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-96 h-16' : 'w-96 h-[500px]'
    }`}>
      <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden h-full flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                💬
              </div>
              <h3 className="font-semibold">Room Chat</h3>
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  {unreadCount} new
                </span>
              )}
              <div className="flex items-center space-x-1 text-white text-opacity-80">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">{messages.length} messages</span>
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
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 bg-gray-900 overflow-y-auto">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      💭
                    </div>
                    <p className="font-medium mb-2 text-gray-300">No messages yet.</p>
                    <p className="text-sm text-gray-500">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isOwnMessage = message.user_id === session?.user?.id;
                    const showAvatar = index === 0 || messages[index - 1].user_id !== message.user_id;
                    
                    return (
                      <div key={message.id} className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                        {showAvatar && !isOwnMessage && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                            {message.user_name?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                        {!showAvatar && !isOwnMessage && <div className="w-8"></div>}
                        
                        <div className={`flex-1 max-w-xs ${isOwnMessage ? 'text-right' : ''}`}>
                          {showAvatar && (
                            <div className={`flex items-baseline gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                              <span className={`font-semibold text-sm ${isOwnMessage ? 'text-blue-400' : 'text-gray-300'}`}>
                                {isOwnMessage ? 'You' : message.user_name || "Anonymous"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTime(message.created_at)}
                              </span>
                            </div>
                          )}
                          <div className={`inline-block px-4 py-2 rounded-2xl max-w-full break-words ${
                            isOwnMessage 
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                              : 'bg-gray-700 border border-gray-600 text-gray-200 shadow-sm'
                          }`}>
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 bg-gray-800 border-t border-gray-700 flex-shrink-0">
              <form onSubmit={sendMessage} className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={!session || isSending}
                    className="pr-12 rounded-full border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-xs text-gray-500">
                      {newMessage.length > 0 && `${newMessage.length}/500`}
                    </span>
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() || !session || isSending}
                  className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg"
                >
                  {isSending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
