import React, { useState } from 'react';
import { askTrustTagAssistant, ChatMessage } from '../services/geminiChat';

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProduct?: any | null;
}

export const ChatbotModal: React.FC<ChatbotModalProps> = ({
  isOpen,
  onClose,
  currentProduct
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello! I am the Trust Chain AI Advisor. Ask me how to register products on the blockchain, how live QR scanning detects REAL vs FAKE products, or how decentralized proof of custody prevents counterfeit replicas.`,
      sources: ['Trust Chain Blockchain Ledger', 'Global Anti-Counterfeit Standards'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [queryInput, setQueryInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend: string = queryInput) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setQueryInput('');
    setIsLoading(true);

    try {
      const reply = await askTrustTagAssistant(textToSend, messages, currentProduct);
      const assistantMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: reply,
        sources: ['Product Registry', 'Blockchain Smart Contract Proofs'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'How do I register a product on the blockchain?',
    'How does Trust Chain detect real vs fake items?',
    'Can counterfeiters copy or photocopy a QR code?',
    'What happens when a scanned item shows FAKE?'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl h-[580px] bg-white border border-[#bccac0]/40 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-[#f4f3f1] border-b border-[#bccac0]/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#006948] flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            </div>
            <div>
              <div className="text-sm font-bold text-[#1a1c1a] flex items-center gap-1.5">
                TrustChain Helpdesk & Provenance AI
                <span className="text-[10px] text-[#006948] bg-[#85f8c4]/40 font-mono font-semibold px-1.5 py-0.2 rounded">
                  Gemini 2.5
                </span>
              </div>
              <div className="text-[11px] text-[#3d4a42]">
                Grounded in blockchain ledger, recall databases, and AI vision rules
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-[#3d4a42] flex items-center justify-center hover:bg-[#e9e8e5] transition-colors cursor-pointer border border-[#bccac0]/30"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#faf9f6]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs shadow-2xs ${
                  m.sender === 'user'
                    ? 'bg-[#006948] text-white font-bold'
                    : 'bg-white text-[#006948] border border-[#bccac0]/30'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {m.sender === 'user' ? 'person' : 'smart_toy'}
                </span>
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-1.5 shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-[#006948] text-white rounded-tr-none'
                    : 'bg-white text-[#1a1c1a] border border-[#bccac0]/30 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                {m.sources && m.sources.length > 0 && (
                  <div className={`pt-2 border-t text-[10px] font-mono ${
                    m.sender === 'user' ? 'border-white/20 text-white/80' : 'border-[#bccac0]/25 text-[#6d7a72]'
                  }`}>
                    Sources: {m.sources.join(' · ')}
                  </div>
                )}
                <div className={`text-[10px] text-right font-mono ${
                  m.sender === 'user' ? 'text-white/70' : 'text-[#6d7a72]'
                }`}>
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-[#006948] font-mono italic p-2 bg-white rounded-xl border border-[#bccac0]/30 w-fit shadow-xs">
              <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
              <span>Querying blockchain records & official CDSCO notices...</span>
            </div>
          )}
        </div>

        {/* Prompt Suggestions */}
        <div className="p-2.5 bg-[#f4f3f1] border-t border-[#bccac0]/25 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-[#6d7a72] font-semibold uppercase text-[10px] whitespace-nowrap pl-1">
            Try:
          </span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-[#85f8c4]/40 text-[#1a1c1a] border border-[#bccac0]/30 whitespace-nowrap cursor-pointer transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-[#bccac0]/30 flex items-center gap-2"
        >
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Ask about product authenticity, batches, or recalls..."
            className="flex-1 bg-[#f4f3f1] text-[#1a1c1a] text-xs px-3.5 py-2.5 rounded-xl border border-[#bccac0]/40 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#006948]"
          />
          <button
            type="submit"
            disabled={!queryInput.trim() || isLoading}
            className="p-2.5 rounded-xl bg-[#006948] text-white hover:bg-[#00855d] transition-all disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
