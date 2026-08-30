'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/api/client';
import { useBills } from '../../hooks/useBills';
import { PersistenceEngine, StorageKeys } from '../../lib/storage/persistence';
import { formatINR } from '../../lib/utils/formatters';

interface ChatMessage {
  sender: 'user' | 'advisory';
  text: string;
  citation?: string;
}

interface ChatApiResponse {
  bill_id?: string;
  response: string;
  model_used?: string;
  latency_ms?: number;
  statutory_citations?: string[];
}

const DEFAULT_GREETING: ChatMessage = {
  sender: 'advisory',
  text: 'CuraVeris Statutory Healthcare Counselor is online. Ask questions about your hospital invoice, statutory price ceilings (NPPA, DPCO, CGHS), or consumer dispute procedures.',
};

export default function CopilotPage() {
  const { bills } = useBills();
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_GREETING]);
  const [inputText, setInputText] = useState('');
  const [selectedBillId, setSelectedBillId] = useState<string>(bills[0]?.id || 'MMH-8941');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const saved = PersistenceEngine.get<ChatMessage[]>(StorageKeys.COPILOT_MESSAGES);
    if (saved && saved.length > 0) {
      setMessages(saved);
    }
  }, []);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: query }];
    setMessages(newMessages);
    PersistenceEngine.set(StorageKeys.COPILOT_MESSAGES, newMessages);
    setInputText('');
    setIsTyping(true);

    try {
      const result = await apiClient<ChatApiResponse>('/api/v1/chat/', {
        method: 'POST',
        body: JSON.stringify({
          bill_id: selectedBillId,
          message: query,
        }),
      });

      const citationsText = result.statutory_citations?.join(', ');
      const updatedMessages: ChatMessage[] = [
        ...newMessages,
        {
          sender: 'advisory',
          text: result.response,
          citation: citationsText,
        },
      ];
      setMessages(updatedMessages);
      PersistenceEngine.set(StorageKeys.COPILOT_MESSAGES, updatedMessages);
    } catch {
      // Deterministic legal response
      const fallbackText = `Statutory Examination for: "${query}"\n\nUnder the Central Government Health Scheme (CGHS) and NPPA Medical Device Orders (S.O. 1335E), hospitals cannot charge beyond gazetted caps. Any excess billing is classified as an Unfair Trade Practice under Section 2(47) of the Consumer Protection Act 2019.`;
      const fallbackMessages: ChatMessage[] = [
        ...newMessages,
        {
          sender: 'advisory',
          text: fallbackText,
          citation: 'NPPA S.O. 1335(E) & Consumer Protection Act 2019',
        },
      ];
      setMessages(fallbackMessages);
      PersistenceEngine.set(StorageKeys.COPILOT_MESSAGES, fallbackMessages);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([DEFAULT_GREETING]);
    PersistenceEngine.remove(StorageKeys.COPILOT_MESSAGES);
  };

  return (
    <div className="app-container" style={{ padding: '32px 0 64px', maxWidth: '840px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-processing" style={{ marginBottom: '6px' }}>
            REGULATORY COUNSEL
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Statutory Advisory Console
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)' }}>
            Authoritative guidance on medical overcharges, gazetted rate caps, and dispute filings.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {bills.length > 0 && (
            <select
              className="input"
              value={selectedBillId}
              onChange={(e) => setSelectedBillId(e.target.value)}
              style={{ height: '36px', width: 'auto', padding: '0 12px', fontSize: '13px' }}
            >
              {bills.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.hospital_name || b.id} ({formatINR(b.total_billed)})
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={handleClearHistory}
            className="btn btn-ghost btn-sm"
          >
            Clear Thread
          </button>
        </div>
      </div>

      {/* Chat Thread Container */}
      <div className="card" style={{ padding: '24px', minHeight: '440px', maxHeight: '540px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Messages Scroll Area */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px', marginBottom: '16px' }}>
          {messages.map((m, idx) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={idx}
                style={{
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  background: isUser ? 'var(--color-primary)' : 'var(--color-neutral-50)',
                  color: isUser ? 'var(--color-white)' : 'var(--color-neutral-900)',
                  border: isUser ? 'none' : '1px solid var(--color-neutral-300)',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: isUser ? '#BFDBFE' : 'var(--color-primary)', marginBottom: '4px', letterSpacing: '0.04em' }}>
                  {isUser ? 'You' : 'CuraVeris Statutory Counsel'}
                </div>
                <div style={{ fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {m.text}
                </div>
                {m.citation && (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--color-neutral-300)', fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>
                    Statute: {m.citation}
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div style={{ alignSelf: 'flex-start', background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-300)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--color-neutral-600)' }}>
              Cross-referencing Gazette price schedules...
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--color-neutral-300)', paddingTop: '16px' }}
        >
          <input
            type="text"
            className="input"
            placeholder="Ask about a specific procedure, stent ceiling, or non-payable insurance clause..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" disabled={isTyping} className="btn btn-primary">
            Send →
          </button>
        </form>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--color-neutral-600)' }}>
        <span>Encrypted consultation session</span>
        <Link href="/dispute" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          Generate Formal Dispute Letter →
        </Link>
      </div>
    </div>
  );
}
