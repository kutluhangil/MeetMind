'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface MeetingChatProps {
  meetingId: string;
}

export function MeetingChat({ meetingId }: MeetingChatProps) {
  const t = useTranslations('meeting.chat');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Load message history on open
  useEffect(() => {
    if (!isOpen) return;

    const fetchHistory = async () => {
      setInitialLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/meetings/${meetingId}/chat`);
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data = await res.json() as { messages: Message[] };
        setMessages(data.messages);
      } catch (err) {
        setError(t('error'));
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen, meetingId, t]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessageContent = input.trim();
    setInput('');
    setLoading(true);
    setError(null);

    // Optimistically add user message to list
    const tempUserMsg: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: userMessageContent,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`/api/meetings/${meetingId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userMessageContent })
      });

      if (!res.ok) {
        const errorData = await res.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await res.json() as { userMessage: Message; assistantMessage: Message };
      
      // Replace optimistic message and add AI response
      setMessages((prev) => 
        prev.map((msg) => msg.id === tempUserMsg.id ? data.userMessage : msg)
          .concat(data.assistantMessage)
      );
    } catch (err) {
      setError(t('error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-phosphor text-obsidian-950 flex items-center justify-center shadow-lg hover:bg-phosphor-glow transition-all duration-300 z-40 group"
        aria-label="Ask AI Assistant"
      >
        <span className="absolute -inset-1 rounded-full bg-phosphor/20 blur group-hover:blur-md transition duration-300"></span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6 relative z-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* Slide-out Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-40 cursor-pointer"
            />

            {/* Sidebar Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-obsidian-950 border-l border-obsidian-700 flex flex-col shadow-2xl z-50"
            >
              {/* Panel Header */}
              <div className="p-4 border-b border-obsidian-700 flex items-center justify-between bg-obsidian-900">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-phosphor/10 border border-phosphor/20 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-phosphor" />
                  </div>
                  <h2 className="font-display font-semibold text-slate-100 text-sm">{t('title')}</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-obsidian-800 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Message History Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-grid bg-noise">
                {initialLoading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-2">
                    <div className="w-6 h-6 border-2 border-phosphor border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-500">Loading history...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-obsidian-800 border border-obsidian-700 flex items-center justify-center text-slate-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.92 1.786c-.082.1-.079.245.024.331a.424.424 0 00.324.084c1.823-.426 3.6-.03 4.902.662.597.319 1.295.467 1.99.467z"
                        />
                      </svg>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-[280px]">
                      {t('empty')}
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed border ${
                            isUser
                              ? 'bg-obsidian-800 text-slate-100 border-obsidian-600'
                              : 'bg-obsidian-900/80 text-slate-100 border-phosphor/20 shadow-sm shadow-phosphor/5'
                          }`}
                        >
                          {!isUser && (
                            <div className="flex items-center gap-1.5 mb-1 text-phosphor text-[10px] uppercase font-bold tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-phosphor"></span>
                              MeetMind
                            </div>
                          )}
                          <p className="whitespace-pre-line">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* AI Typing Indicator */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl p-3.5 bg-obsidian-900/80 border border-phosphor/10 flex flex-col space-y-2">
                      <div className="flex items-center gap-1.5 text-phosphor text-[10px] uppercase font-bold tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-phosphor animate-pulse"></span>
                        {t('loading')}
                      </div>
                      <div className="flex items-center gap-1 py-1">
                        <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-red-400 text-xs text-center">
                    {error}
                  </div>
                )

                }
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSend} className="p-4 border-t border-obsidian-700 bg-obsidian-900">
                <div className="relative flex items-center">
                  <textarea
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('placeholder')}
                    disabled={loading || initialLoading}
                    className="w-full pl-4 pr-12 py-3 rounded-xl bg-obsidian-850 border border-obsidian-600 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-phosphor/50 resize-none max-h-24 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading || initialLoading}
                    className="absolute right-2 p-2 rounded-lg bg-phosphor text-obsidian-950 hover:bg-phosphor-glow disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                      />
                    </svg>
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
