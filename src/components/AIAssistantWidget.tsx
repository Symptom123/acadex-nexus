import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, MessageSquare, Loader2 } from "lucide-react";
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

const AIAssistantWidget = ({ role }: AIAssistantWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: `Hello! I'm your ACADEX AI Smart Coach. How can I help you as a ${role} today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Prepare chat history
    const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));

    const aiResponseText = await generateAIChatResponse(userMsg.content, chatHistory, role);

    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "ai", content: aiResponseText };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 p-4 rounded-full bg-primary text-white shadow-xl hover:bg-primary/90 transition-colors z-[100] flex items-center justify-center group"
          >
            <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] bg-card border border-border/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[100] backdrop-blur-xl bg-card/95"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI Smart Coach</h3>
                  <p className="text-[10px] text-muted-foreground">Always here to help</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-secondary text-secondary-foreground rounded-tl-sm border border-border/30"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl p-4 text-sm bg-secondary text-secondary-foreground rounded-tl-sm border border-border/30 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-muted-foreground text-xs">AI is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-3 border-t border-border/50 bg-card">
              <div className="flex items-center gap-2 relative">
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  className="flex-1 bg-secondary/50 border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  disabled={isTyping}
                />
                <Button
                  size="icon"
                  className="h-10 w-10 rounded-full shrink-0"
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistantWidget;
