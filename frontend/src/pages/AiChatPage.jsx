import { useEffect, useRef, useState } from "react";
import {
  Bot,
  ChevronRight,
  CircleStop,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/axios";

const INITIAL_MESSAGE = {
  role: "assistant",
  content:
    "Hi! I'm your SmartMoney AI advisor. I can help you understand your spending, improve your budget, and find practical ways to save money.",
};

const QUICK_PROMPTS = [
  {
    title: "Analyze my spending",
    text: "What can you tell me about my spending patterns?",
  },
  {
    title: "Improve my budget",
    text: "How can I improve my current budget?",
  },
  {
    title: "Help me save",
    text: "Give me some practical ways to save more money.",
  },
  {
    title: "Financial check-up",
    text: "Give me a quick financial check-up based on my data.",
  },
];

export default function AiChatPage() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  const clearConversation = () => {
    if (loading) return;

    setMessages([INITIAL_MESSAGE]);
    setInput("");

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const sendMessage = async (messageOverride = null) => {
    const userMessage = (messageOverride ?? input).trim();

    if (!userMessage || loading) return;

    setInput("");

    const conversationHistory = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setLoading(true);

    try {
      const response = await api.post("/ai/chat", {
        message: userMessage,
        conversationHistory,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            response.data?.response ||
            "I wasn't able to generate a response. Please try again.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't process that request right now. Please try again.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const isEmptyConversation =
    messages.length === 1 && messages[0].role === "assistant";

  return (
    <>
      <style>{`
        .ai-page {
          min-height: calc(100vh - 7rem);
          display: flex;
          flex-direction: column;
          color: #e5e7eb;
        }

        .ai-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .ai-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .ai-title-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.18);
          color: #a5b4fc;
          flex-shrink: 0;
        }

        .ai-title {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.3;
          font-weight: 650;
          letter-spacing: -0.02em;
          color: #f3f4f6;
        }

        .ai-subtitle {
          margin: 0.2rem 0 0;
          color: #71717a;
          font-size: 0.78rem;
        }

        .ai-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .ai-clear {
          color: #a1a1aa;
          border-color: #27272a;
          background: transparent;
        }

        .ai-clear:hover {
          color: #e4e4e7;
          background: #18181b;
          border-color: #3f3f46;
        }

        .ai-shell {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #242429;
          border-radius: 18px;
          background: #0d0d11;
        }

        .ai-messages {
          flex: 1;
          min-height: 300px;
          overflow-y: auto;
          padding: 1.5rem;
          scrollbar-width: thin;
          scrollbar-color: #27272a transparent;
        }

        .ai-messages::-webkit-scrollbar {
          width: 6px;
        }

        .ai-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .ai-messages::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 99px;
        }

        .ai-empty {
          min-height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          text-align: center;
        }

        .ai-empty-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background: #15151b;
          border: 1px solid #27272d;
          color: #a5b4fc;
          margin-bottom: 1rem;
        }

        .ai-empty-title {
          margin: 0;
          color: #f4f4f5;
          font-size: 1.05rem;
          font-weight: 600;
        }

        .ai-empty-description {
          max-width: 430px;
          margin: 0.5rem auto 0;
          color: #71717a;
          font-size: 0.84rem;
          line-height: 1.6;
        }

        .quick-prompts {
          width: 100%;
          max-width: 620px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.65rem;
          margin-top: 1.5rem;
        }

        .quick-prompt {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          text-align: left;
          padding: 0.8rem 0.9rem;
          border: 1px solid #27272d;
          border-radius: 12px;
          background: #111116;
          color: #d4d4d8;
          transition:
            border-color 0.18s ease,
            background 0.18s ease,
            transform 0.18s ease;
        }

        .quick-prompt:hover {
          background: #15151b;
          border-color: #3f3f46;
          transform: translateY(-1px);
        }

        .quick-prompt-content {
          min-width: 0;
        }

        .quick-prompt-title {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #e4e4e7;
        }

        .quick-prompt-text {
          display: block;
          margin-top: 0.2rem;
          color: #71717a;
          font-size: 0.7rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .quick-prompt-icon {
          color: #52525b;
          flex-shrink: 0;
        }

        .message-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .message-row {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .message-row.user {
          justify-content: flex-end;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .message-avatar.assistant {
          background: #17171d;
          border: 1px solid #2b2b32;
          color: #a5b4fc;
        }

        .message-avatar.user {
          background: #24242a;
          border: 1px solid #35353d;
          color: #a1a1aa;
          order: 2;
        }

        .message-content {
          max-width: min(75%, 680px);
        }

        .message-bubble {
          padding: 0.78rem 0.95rem;
          border-radius: 14px;
          font-size: 0.88rem;
          line-height: 1.65;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .message-bubble.assistant {
          color: #d4d4d8;
          background: #141419;
          border: 1px solid #25252c;
          border-top-left-radius: 5px;
        }

        .message-bubble.user {
          color: #f4f4f5;
          background: #29292f;
          border: 1px solid #37373f;
          border-top-right-radius: 5px;
        }

        .message-bubble.error {
          color: #fca5a5;
          border-color: rgba(239, 68, 68, 0.2);
          background: rgba(127, 29, 29, 0.12);
        }

        .typing-bubble {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          min-height: 42px;
        }

        .typing-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #71717a;
          animation: aiTyping 1.2s infinite ease-in-out;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.15s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes aiTyping {
          0%, 60%, 100% {
            opacity: 0.35;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-2px);
          }
        }

        .ai-composer-wrap {
          padding: 1rem 1.25rem 1.15rem;
          border-top: 1px solid #242429;
          background: #0d0d11;
        }

        .ai-composer {
          max-width: 900px;
          margin: 0 auto;
        }

        .ai-input-container {
          display: flex;
          align-items: flex-end;
          gap: 0.65rem;
          padding: 0.5rem;
          border: 1px solid #2b2b32;
          border-radius: 15px;
          background: #111116;
          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .ai-input-container:focus-within {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.08);
        }

        .ai-textarea {
          flex: 1;
          min-height: 40px;
          max-height: 140px;
          resize: none;
          border: 0 !important;
          outline: none !important;
          box-shadow: none !important;
          background: transparent !important;
          color: #e4e4e7 !important;
          padding: 0.55rem 0.55rem !important;
          font-size: 0.88rem;
        }

        .ai-textarea::placeholder {
          color: #52525b;
        }

        .ai-send {
          width: 40px;
          height: 40px;
          padding: 0;
          border-radius: 11px;
          flex-shrink: 0;
          background: #6366f1;
          color: white;
        }

        .ai-send:hover {
          background: #5558e8;
        }

        .ai-send:disabled {
          opacity: 0.35;
        }

        .ai-hint {
          margin: 0.55rem 0 0;
          text-align: center;
          color: #52525b;
          font-size: 0.68rem;
        }

        .ai-disclaimer {
          margin-top: 0.4rem;
          text-align: center;
          color: #3f3f46;
          font-size: 0.65rem;
        }

        @media (max-width: 640px) {
          .ai-page {
            min-height: calc(100vh - 5rem);
          }

          .ai-header {
            margin-bottom: 0.75rem;
          }

          .ai-title-icon {
            width: 36px;
            height: 36px;
            border-radius: 10px;
          }

          .ai-title {
            font-size: 1.05rem;
          }

          .ai-subtitle {
            font-size: 0.7rem;
          }

          .ai-clear-text {
            display: none;
          }

          .ai-clear {
            width: 36px;
            height: 36px;
            padding: 0;
          }

          .ai-shell {
            border-radius: 15px;
          }

          .ai-messages {
            padding: 1rem 0.75rem;
          }

          .message-list {
            gap: 1rem;
          }

          .message-content {
            max-width: 82%;
          }

          .message-avatar {
            width: 30px;
            height: 30px;
            border-radius: 9px;
          }

          .message-bubble {
            font-size: 0.82rem;
            padding: 0.7rem 0.8rem;
          }

          .quick-prompts {
            grid-template-columns: 1fr;
            max-width: 360px;
          }

          .ai-composer-wrap {
            padding: 0.75rem;
          }

          .ai-hint {
            display: none;
          }

          .ai-disclaimer {
            margin-top: 0.5rem;
          }
        }
      `}</style>

      <div className="ai-page">
        {/* Header */}
        <header className="ai-header">
          <div className="ai-title-wrap">
            <div className="ai-title-icon">
              <Sparkles size={19} strokeWidth={1.8} />
            </div>

            <div>
              <h1 className="ai-title">AI Financial Advisor</h1>
              <p className="ai-subtitle">
                Your personal assistant for smarter financial decisions
              </p>
            </div>
          </div>

          <div className="ai-actions">
            <Button
              variant="outline"
              size="sm"
              className="ai-clear"
              onClick={clearConversation}
              disabled={loading || isEmptyConversation}
            >
              <Trash2 size={15} />
              <span className="ai-clear-text ml-2">Clear</span>
            </Button>
          </div>
        </header>

        {/* Chat */}
        <section className="ai-shell">
          <div className="ai-messages">
            {isEmptyConversation ? (
              <div className="ai-empty">
                <div className="ai-empty-icon">
                  <MessageSquare size={24} strokeWidth={1.7} />
                </div>

                <h2 className="ai-empty-title">
                  What would you like to know?
                </h2>

                <p className="ai-empty-description">
                  Ask about your spending, budgets, savings, or anything else
                  related to your personal finances.
                </p>

                <div className="quick-prompts">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.title}
                      type="button"
                      className="quick-prompt"
                      onClick={() => sendMessage(prompt.text)}
                      disabled={loading}
                    >
                      <span className="quick-prompt-content">
                        <span className="quick-prompt-title">
                          {prompt.title}
                        </span>
                        <span className="quick-prompt-text">
                          {prompt.text}
                        </span>
                      </span>

                      <ChevronRight
                        size={15}
                        className="quick-prompt-icon"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="message-list">
                {messages.map((message, index) => {
                  const isUser = message.role === "user";

                  return (
                    <div
                      key={`${message.role}-${index}`}
                      className={`message-row ${isUser ? "user" : "assistant"}`}
                    >
                      {!isUser && (
                        <div className="message-avatar assistant">
                          <Bot size={16} strokeWidth={1.8} />
                        </div>
                      )}

                      <div className="message-content">
                        <div
                          className={`message-bubble ${
                            isUser ? "user" : "assistant"
                          } ${message.error ? "error" : ""}`}
                        >
                          {message.content}
                        </div>
                      </div>

                      {isUser && (
                        <div className="message-avatar user">
                          <User size={15} strokeWidth={1.8} />
                        </div>
                      )}
                    </div>
                  );
                })}

                {loading && (
                  <div className="message-row assistant">
                    <div className="message-avatar assistant">
                      <Bot size={16} strokeWidth={1.8} />
                    </div>

                    <div className="message-content">
                      <div className="message-bubble assistant typing-bubble">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="ai-composer-wrap">
            <div className="ai-composer">
              <div className="ai-input-container">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your finances..."
                  rows={1}
                  disabled={loading}
                  className="ai-textarea"
                />

                <Button
                  type="button"
                  className="ai-send"
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  aria-label={loading ? "Sending message" : "Send message"}
                >
                  {loading ? (
                    <CircleStop size={17} />
                  ) : (
                    <Send size={17} />
                  )}
                </Button>
              </div>

              <p className="ai-hint">
                Enter to send · Shift + Enter for a new line
              </p>

              <p className="ai-disclaimer">
                SmartMoney AI provides guidance for informational purposes.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}