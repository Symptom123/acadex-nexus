import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Loader2, Sparkles, Trash2 } from "lucide-react";
import { generateAIChatResponse } from "@/lib/gemini";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

interface AIAssistantWidgetProps {
  role: string;
}

const quickPrompts: Record<string, string[]> = {
  Student: [
    "How can I improve my grades?",
    "Tips for better study habits",
    "Help me prepare for exams",
  ],
  Teacher: [
    "Strategies for struggling students",
    "How to boost class engagement",
    "Tips for effective grading",
  ],
  Parent: [
    "How to support my child's learning",
    "Understanding my child's grades",
    "Tips for homework motivation",
  ],
  Admin: [
    "How to improve school performance",
    "Tips for teacher retention",
    "Strategies for better attendance",
  ],
};

const AIAssistantWidget = ({ role }: AIAssistantWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: `👋 Hello! I'm your ACADEX AI Smart Coach. I'm here to help you as a ${role}. Ask me anything about academics, performance tips, or how to use your dashboard!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Auto-focus input when chat opens
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [messages, isOpen]);

  const handleSend = async (overrideMsg?: string) => {
    const text = overrideMsg || input.trim();
    if (!text) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
    const aiResponseText = await generateAIChatResponse(text, chatHistory, role);

    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "ai", content: aiResponseText };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "ai",
        content: `🔄 Chat cleared! How can I help you today?`,
      },
    ]);
  };

  const suggestions = quickPrompts[role] || quickPrompts["Student"];
  const showSuggestions = messages.length <= 1 && !isTyping;

  return (
    <>
      {/* Floating button with pulse animation */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[100] group"
          >
            {/* Pulse rings */}
            <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/20 to-primary/5 blur-md" />
            
            {/* Button */}
            <span className="relative flex items-center gap-2 px-5 py-3.5 rounded-full bg-primary text-white shadow-2xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300">
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="text-sm font-semibold hidden sm:inline">AI Coach</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 w-[360px] sm:w-[400px] h-[520px] rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[100] border border-border/40"
            style={{
              background: "linear-gradient(to bottom, hsl(var(--card)), hsl(var(--card) / 0.97))",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between px-5 py-4 border-b border-border/40"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--primary) / 0.03))" }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  {/* Online indicator */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">AI Smart Coach</h3>
                  <p className="text-[10px] text-emerald-600 font-medium">● Online — {role} Mode</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive" 
                  onClick={handleClearChat}
                  title="Clear chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i === messages.length - 1 ? 0.1 : 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "ai" && (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2 mt-1 shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-md"
                        : "bg-secondary/80 text-secondary-foreground rounded-tl-md border border-border/20"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2 mt-1 shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-secondary/80 border border-border/20 rounded-tl-md flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-muted-foreground text-xs">Thinking...</span>
                  </div>
                </motion.div>
              )}

              {/* Quick suggestion chips */}
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="pt-2"
                >
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2 px-1">Quick questions</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(s)}
                        className="text-xs px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors font-medium"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-3 border-t border-border/40 bg-card/80">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask your AI Coach..."
                  className="flex-1 bg-secondary/40 border border-border/40 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all placeholder:text-muted-foreground/50"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) handleSend();
                  }}
                  disabled={isTyping}
                />
                <Button
                  size="icon"
                  className="h-10 w-10 rounded-full shrink-0 shadow-md shadow-primary/10"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[9px] text-muted-foreground/50 text-center mt-2">Powered by Gemini AI</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistantWidget;
