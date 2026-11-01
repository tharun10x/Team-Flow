import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom"; 
import { useChannel } from "../context/ChannelContext"; 
import api from "../api/axios";
import { Send, MoreVertical, Pencil, Trash2, X, Check, Reply } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useStompClient } from "../hooks/useStompClient";


interface ReactionData {
  emoji: string;
  count: number;
  userIds: number[];   // ← matches your backend field name
}
interface ReplyPreviewData {
  id: number;
  senderName: string;
  content: string;
}
interface ChatMessage {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  timestamp?: string;
  channelId: number;
  isEdited?:boolean;
  isDeleted?:boolean;
  reactions:ReactionData[];
  replyToId?: number | null;
  replyTo?: ReplyPreviewData | null;
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

  const[showPickerForMessageId, setShowPickerForMessageId] = useState<number | null >(null);

  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
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

  const handleReaction = async (messageId:number, emoji:string)=>{ 
    try {
      await api.post(`messages/${messageId}/reactions`, {emoji});
      setShowPickerForMessageId(null);
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // *This useEffect runs when the channelId changes
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

  // *This useEffect runs for any chanegs in channelId,client,isConnected
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
      channelId: Number(channelId),
      replyToId: replyingTo ? replyingTo.id : null
    };

    client.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(chatMessage),
    });

    setInput("");
    setReplyingTo(null);
  };

  if (!channelId) {
    return (
      <div className="flex h-full items-center justify-center bg-paper-2">
        <p className="text-sm text-muted">Select a channel from the sidebar to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-paper">
      {/* Dynamic Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-rule px-6">
        <div>
          <h1 className="section-title">
            # {activeChannel ? activeChannel.name : "channel"}
          </h1>
          <p className="sr-only">Channel conversation</p>
        </div>
        <div className="flex items-center gap-2" role="status">
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-success' : 'bg-warn'}`}></span>
            <span className="text-xs text-muted">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 md:px-6">
        {messages.length === 0 ? (
          <div className="mx-auto mt-16 max-w-md border-b border-rule pb-6">
            <p className="mb-1 font-display text-2xl font-semibold tracking-display text-ink">
              Welcome to #{activeChannel?.name || "this channel"}!
            </p>
            <p className="text-sm text-ink-2">This is the start of the #{activeChannel?.name || "channel"} channel.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
          const isMe = Number(msg.senderId) === Number(user?.id) || (Boolean(msg.senderName) && msg.senderName === user?.name);
          const isEditing = editingMessageId === msg.id;

          return (
            <div 
              key={msg.id || idx} 
              className={`group relative flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`avatar avatar-lg ${isMe ? 'bg-graphite text-graphite-ink' : ''}`}>
                {msg.senderAvatar || msg.senderName?.charAt(0).toUpperCase()}
              </div>

              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                {/* Header: Name + Time + (edited) */}
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-medium text-ink">{isMe ? 'You' : msg.senderName}</span>
                  
                  {msg.timestamp && (
                    <span className="text-xs tabular-nums text-muted">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}

                  {msg.isEdited && !msg.isDeleted && (
                    <span className="text-xs text-muted">(edited)</span>
                  )}
                </div>
                {/* The reply button to start replying */}
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
                      aria-label="Edit message"
                      className="field min-w-64"
                    />
                    <button
                      onClick={() => handleSaveEdit(msg.id!)}
                      type="button"
                      className="btn btn-ghost btn-icon text-success!"
                      title="Save"
                      aria-label="Save"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      type="button"
                      className="btn btn-ghost btn-icon"
                      title="Cancel"
                      aria-label="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                  <div className="relative group/bubble flex items-center gap-1">
                    {/* The Message Bubble */}
                    <div
                      className={`wrap-break-word rounded-card px-3.5 py-2 text-sm leading-relaxed ${
                        msg.isDeleted
                          ? 'border border-dashed border-rule-2 text-muted italic'
                          : isMe
                          ? 'rounded-tr-none bg-graphite text-graphite-ink'
                          : 'rounded-tl-none border border-rule bg-key-face text-ink'
                      }`}
                      onClick={()=>setShowPickerForMessageId(msg.id)}
                    >
                      {msg.replyTo && (
                        <div
                          className={`mb-1.5 border-l-2 py-0.5 pl-2 text-xs ${
                            isMe
                              ? 'border-graphite-muted text-graphite-muted'
                              : 'border-rule-2 text-muted'
                          }`}
                        >
                          <div   className={`text-xs font-medium leading-tight ${
                              isMe ? 'text-graphite-ink' : 'text-ink-2'
                            }`}>
                            {msg.replyTo.senderName}
                          </div>
                          <div className="truncate text-xs">
                            {msg.replyTo.content}
                          </div>
                        </div>
                      )}
                      {msg.content}
                    </div>
                    {!msg.isDeleted && (
                      <button
                        onClick={() => setReplyingTo(msg)}
                        type="button"
                        className="btn btn-ghost btn-icon min-h-7! w-7! opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                        title="Reply"
                        aria-label="Reply"
                      >
                        <Reply className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {
                      showPickerForMessageId === msg.id &&(
                       <div className="pop absolute -top-11 right-2 flex items-center gap-0.5 rounded-pill! px-1 py-1">
                          {['👍', '❤️', '😂', '🎉', '🚀'].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(msg.id!, emoji)}
                              type="button"
                              aria-label={`React with ${emoji}`}
                              className="btn btn-ghost btn-icon min-h-8! w-8! rounded-pill! text-base"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}

                    {/* "..." Action Menu (Only on own messages and if not deleted) */}
                    {isMe && !msg.isDeleted && (
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === msg.id ? null : msg.id!)}
                          type="button"
                          className="btn btn-ghost btn-icon min-h-7! w-7! opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                          title="More actions"
                          aria-label="More actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Popup */}
                        {activeMenuId === msg.id && (
                          <div className="pop absolute right-0 top-full mt-1 w-32 py-1">
                            <button
                              onClick={() => handleStartEdit(msg)}
                              type="button"
                              className="row-btn rounded-none!"
                            >
                              <Pencil className="w-3.5 h-3.5 text-muted" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(msg.id!)}
                              type="button"
                              className="row-btn rounded-none! text-error! hover:bg-error-wash!"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* The reaction bubbles under the message bubble */}
                  {msg.reactions && (msg.reactions.length > 0) && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {msg.reactions.map((r) => {
                        const iReacted = r.userIds?.includes(Number(user?.id));
                        return (
                          <button
                            key={r.emoji}
                            onClick={() => handleReaction(msg.id!, r.emoji)}
                            aria-pressed={iReacted}
                            className={`flex min-h-7 items-center gap-1 rounded-pill border px-2 text-xs tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-focus ${
                              iReacted
                                ? 'border-accent bg-accent-wash font-medium text-ink'
                                : 'border-rule bg-key-face text-ink-2 hover:bg-paper-3'
                            }`}
                          >
                            <span>{r.emoji}</span>
                            <span>{r.count}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  </>
                )}
              </div>
            </div>
          );
        })
        )}
        <div ref={messagesEndRef} />
      </div>
        {replyingTo && (
          <div className="mx-4 mb-2 flex items-center justify-between rounded-card border border-rule bg-paper-2 px-4 py-2 text-sm md:mx-6">
            <div className="flex items-center gap-2 truncate">
              <Reply className="h-3.5 w-3.5 shrink-0 text-muted" />
              <span className="text-muted">Replying to <strong className="text-ink">{replyingTo.senderName}</strong>:</span>
              <span className="truncate text-muted italic">"{replyingTo.content}"</span>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              type="button"
              aria-label="Cancel reply"
              className="btn btn-ghost btn-icon min-h-7! w-7!"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      {/* Input Area */}
      <div className="shrink-0 border-t border-rule px-4 py-3 md:px-6">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isConnected ? `Message #${activeChannel?.name || "channel"}` : "Connecting..."}
            aria-label="Message"
            className="field field-lg pr-14!"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!isConnected || !input.trim()}
            aria-label="Send"
            className="btn btn-icon absolute right-1.5"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}