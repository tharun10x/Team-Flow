import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom"; 
import { useChannel } from "../context/ChannelContext"; 
import api from "../api/axios";
import { Send, MoreVertical, Pencil, Trash2, X, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useStompClient } from "../hooks/useStompClient";

interface ChatMessage {
  id?: number;
  content: string;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  timestamp?: string;
  channelId: number;
  isEdited?:boolean;
  isDeleted?:boolean;
}

export function ChatArea() {
  const { channelId } = useParams<{ channelId: string }>(); 
  const { channels } = useChannel();
  const activeChannel = channels.find((c) => String(c.id) === channelId);
  
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { client, isConnected } = useStompClient();

  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  // Start editing
  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMessageId(msg.id!);
    setEditText(msg.content);
    setActiveMenuId(null);
  };

  // Save edited message via PUT
  const handleSaveEdit = async (messageId: number) => {
    if (!editText.trim()) return;
    try {
      await api.put(`messages/${messageId}`, { content: editText });
      setEditingMessageId(null);
      setEditText("");
    } catch (error) {
      console.error("Failed to edit message", error);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  // Delete message via DELETE
  const handleDelete = async (messageId: number) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await api.delete(`messages/${messageId}`);
      setActiveMenuId(null);
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //This useEffect runs when the channelId changes
  useEffect(() => {
    if (!channelId) return;

    const fetchHistory = async () => {
      try {
        const res = await api.get(`channels/${channelId}/messages?page=0&size=50`);
        setMessages(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch message history", error);
      }
    };
    fetchHistory();

  }, [channelId]); 

  //This useEffect runs for any chanegs in channelId,client,isConnected
  useEffect(()=>{

    if(!channelId || !client || !isConnected) return;
    const subscription = client.subscribe(`/topic/channel/${channelId}`,(msg)=>{
      const newMsg : ChatMessage = JSON.parse(msg.body);
      
      setMessages((prev) =>{  
        const exists = prev.some((m) => m.id === newMsg.id);
        if (exists) {
          return prev.map((m) => (m.id === newMsg.id ? newMsg : m));
        }
        return [...prev, newMsg];
      });
    });

    return () => {
      subscription.unsubscribe();
    };

  },[channelId,client,isConnected]);


  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !client || !isConnected || !channelId) return;

    const chatMessage = {
      content: input,
      channelId: Number(channelId)
    };

    client.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(chatMessage),
    });

    setInput("");
  };

  if (!channelId) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Select a channel from the sidebar to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Dynamic Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            # {activeChannel ? activeChannel.name : "channel"}
          </h1>
          <p className="text-xs text-gray-500">Channel conversation</p>
        </div>
        <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}></span>
            <span className="text-xs text-gray-500 font-medium">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 flex flex-col items-center">
            <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl">👋</span>
            </div>
            <p className="font-semibold text-gray-900 text-base mb-1">
              Welcome to #{activeChannel?.name || "this channel"}!
            </p>
            <p className="text-xs text-gray-400">This is the start of the #{activeChannel?.name || "channel"} channel.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
          const isMe = Number(msg.senderId) === Number(user?.id) || (Boolean(msg.senderName) && msg.senderName === user?.name);
          const isEditing = editingMessageId === msg.id;

          return (
            <div 
              key={msg.id || idx} 
              className={`relative group flex gap-3 ${isMe ? 'flex-row-reverse' : ''} animate-in fade-in duration-200`}
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                {msg.senderAvatar || msg.senderName?.charAt(0).toUpperCase()}
              </div>

              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                {/* Header: Name + Time + (edited) */}
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-gray-900 text-xs">{isMe ? 'You' : msg.senderName}</span>
                  
                  {msg.timestamp && (
                    <span className="text-[10px] text-gray-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}

                  {msg.isEdited && !msg.isDeleted && (
                    <span className="text-[10px] text-gray-400 italic">(edited)</span>
                  )}
                </div>

                {/* Message Content OR Inline Edit Mode */}
                {isEditing ? (
                  <div className="flex items-center gap-2 mt-1 w-full">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(msg.id!);
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      autoFocus
                      className="px-3 py-1.5 text-sm border border-indigo-400 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    />
                    <button
                      onClick={() => handleSaveEdit(msg.id!)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Save"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative group/bubble flex items-center gap-1">
                    {/* The Message Bubble */}
                    <div
                      className={`px-4 py-2 text-sm leading-relaxed wrap-break-word rounded-2xl ${
                        msg.isDeleted
                          ? 'bg-gray-100 text-gray-400 italic border border-gray-200'
                          : isMe
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-gray-100 text-gray-800 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* "..." Action Menu (Only on own messages and if not deleted) */}
                    {isMe && !msg.isDeleted && (
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === msg.id ? null : msg.id!)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all"
                          title="More actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Popup */}
                        {activeMenuId === msg.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-20 w-28 animate-in fade-in zoom-in-95">
                            <button
                              onClick={() => handleStartEdit(msg)}
                              className="w-full px-3 py-1.5 text-xs text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
                            >
                              <Pencil className="w-3.5 h-3.5 text-gray-500" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(msg.id!)}
                              className="w-full px-3 py-1.5 text-xs text-left text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isConnected ? `Message #${activeChannel?.name || "channel"}` : "Connecting..."}
            className="w-full pl-5 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-sm"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!isConnected || !input.trim()}
            className="absolute right-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-40 transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}