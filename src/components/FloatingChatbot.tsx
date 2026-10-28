import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { askTrustChainAssistant, ChatMessage } from '../services/geminiChat';
import { BlockchainProductRecord } from '../types';

interface FloatingChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  currentProduct?: BlockchainProductRecord | any | null;
  justEnteredScanner?: boolean;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({
  isOpen,
  onToggle,
  currentProduct,
  justEnteredScanner = false
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello! I'm your **Product Assistant**.

I can help you:
- **Food & Nutrition**: Explain calories, ingredients, and allergen warnings
- **Barcodes**: How to scan or verify codes on product packaging
- **Authenticity**: How to tell if a product is genuine or suspicious
- **Registration**: How brands register items in the database

What would you like to check today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [queryInput, setQueryInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showArrivalToast, setShowArrivalToast] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // When user enters scanner section, trigger the arrival greeting toast
  useEffect(() => {
    if (justEnteredScanner) {
      setShowArrivalToast(true);
      const timer = setTimeout(() => {
        setShowArrivalToast(false);
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [justEnteredScanner]);

  const handleSend = async (textToSend: string = queryInput) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setQueryInput('');
    setIsLoading(true);

    try {
      const reply = await askTrustChainAssistant(trimmed, messages, currentProduct);
      const assistantMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: reply,
        sources: ['Product Registry', 'Food Safety Standards'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'How do I scan a barcode?',
    'Is Cadbury Oreo genuine?',
    'Explain nutrition facts',
    'How do brands register items?'
  ];

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'init-reset',
        sender: 'assistant',
        text: 'Chat history cleared. How can I help you check a product today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* 
        FLY-TO-CORNER ANIMATION WHEN ENTERING SCANNER SECTION
        Animated Gemini mascot glides down and docks into the bottom-right corner
      */}
      <AnimatePresence>
        {justEnteredScanner && (
          <motion.div
            initial={{ opacity: 0, scale: 2, x: '-50%', y: '-50%', top: '35%', left: '50%' }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [2, 1.4, 0.9, 0.4],
              top: ['35%', '45%', '85%', '92%'],
              left: ['50%', '65%', '88%', '95%']
            }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-50 pointer-events-none flex items-center justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#006948] text-white flex items-center justify-center shadow-[0_0_40px_rgba(0,105,72,0.8)] border-2 border-[#85f8c4]">
              <span className="material-symbols-outlined text-[32px] animate-spin">smart_toy</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING CORNER CONTAINER: FIXED AT BOTTOM-RIGHT */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end">
        {/* EXPANDED CHAT WINDOW (UPWARD POPUP) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 30, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="w-[calc(100vw-2rem)] sm:w-[420px] h-[560px] max-h-[80vh] bg-white rounded-3xl border border-[#bccac0]/40 shadow-2xl flex flex-col overflow-hidden mb-3"
            >
              {/* Header */}
              <div className="px-5 py-3.5 bg-[#f4f3f1] border-b border-[#bccac0]/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#006948] text-white flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[19px]">chat_bubble</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1a1c1a] flex items-center gap-1.5">
                      <span>Product Assistant</span>
                    </div>
                    <div className="text-[10px] text-[#6d7a72] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse"></span>
                      <span>Ask anything about products</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Clear history */}
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    title="Clear Chat History"
                    className="p-1.5 rounded-lg text-[#6d7a72] hover:bg-white transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                  </button>

                  {/* Minimize / Close */}
                  <button
                    type="button"
                    onClick={onToggle}
                    title="Minimize to Corner"
                    className="w-7 h-7 rounded-full bg-white hover:bg-[#e9e8e5] text-[#3d4a42] border border-[#bccac0]/30 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[17px]">close</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Message Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#faf9f6]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2.5 ${
                      m.sender === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs shadow-2xs ${
                        m.sender === 'user'
                          ? 'bg-[#006948] text-white font-bold'
                          : 'bg-white text-[#006948] border border-[#bccac0]/30'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {m.sender === 'user' ? 'person' : 'smart_toy'}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed space-y-1 shadow-xs ${
                        m.sender === 'user'
                          ? 'bg-[#006948] text-white rounded-tr-none'
                          : 'bg-white text-[#1a1c1a] border border-[#bccac0]/30 rounded-tl-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{m.text}</div>
                      <div
                        className={`text-[9px] text-right font-mono ${
                          m.sender === 'user' ? 'text-white/70' : 'text-[#6d7a72]'
                        }`}
                      >
                        {m.timestamp}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-[#006948] font-mono italic p-2 bg-white rounded-xl border border-[#bccac0]/30 w-fit shadow-xs">
                    <span className="material-symbols-outlined text-[15px] animate-spin">sync</span>
                    <span>Analyzing product registry with Gemini 3.8...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Prompt Suggestions */}
              <div className="px-3 py-2 bg-[#f4f3f1] border-t border-[#bccac0]/25 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
                <span className="text-[#6d7a72] font-semibold uppercase text-[9px] whitespace-nowrap">
                  Quick:
                </span>
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(p)}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-[#85f8c4]/40 text-[#1a1c1a] border border-[#bccac0]/30 whitespace-nowrap cursor-pointer transition-colors text-[10px] font-medium"
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-2.5 bg-white border-t border-[#bccac0]/30 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Ask about barcode verification, food specs, or website tour..."
                  className="flex-1 bg-[#f4f3f1] text-[#1a1c1a] text-xs px-3 py-2 rounded-xl border border-[#bccac0]/40 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#006948]"
                />
                <button
                  type="submit"
                  disabled={!queryInput.trim() || isLoading}
                  className="p-2 rounded-xl bg-[#006948] text-white hover:bg-[#00855d] transition-all disabled:opacity-40 cursor-pointer shadow-xs shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ARRIVAL TOAST NOTIFICATION ON SCANNER ENTRY */}
        <AnimatePresence>
          {showArrivalToast && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={onToggle}
              className="mb-2 bg-[#1a1c1a] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-[#85f8c4]/40 text-xs flex items-center gap-2.5 cursor-pointer hover:bg-[#252825] transition-all max-w-[280px]"
            >
              <div className="w-7 h-7 rounded-full bg-[#006948] text-[#85f8c4] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
              </div>
              <div>
                <div className="font-bold text-[#85f8c4] text-[11px]">Assistant Ready</div>
                <div className="text-[10px] text-white/80">Have questions about a product? Click anytime!</div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowArrivalToast(false);
                }}
                className="text-white/50 hover:text-white"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PERSISTENT FLOATING CORNER BUTTON */}
        <motion.button
          type="button"
          onClick={onToggle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative group px-4 py-3 rounded-full bg-[#006948] hover:bg-[#00855d] text-white shadow-xl shadow-[#006948]/35 border border-[#85f8c4]/50 flex items-center gap-2.5 cursor-pointer transition-all"
        >
          {/* Animated online ring */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#85f8c4] border-2 border-[#faf9f6] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-ping"></span>
          </span>

          <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[19px]">
              {isOpen ? 'expand_more' : 'chat_bubble'}
            </span>
          </div>

          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold leading-tight">
              Assistant
            </div>
            <div className="text-[10px] text-[#85f8c4] leading-tight">
              {isOpen ? 'Click to close' : 'Ask a question'}
            </div>
          </div>
        </motion.button>
      </div>
    </>
  );
};
