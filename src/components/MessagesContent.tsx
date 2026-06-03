import { useState } from "react";
import { Search, Send, Plus, Image, Paperclip, Video, Phone, MoreVertical, Lock, Clock, HelpCircle, Bot, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const conversations = [
  {
    id: 1,
    name: "April Jewell, APRN",
    role: "My Provider",
    preview: "I've reviewed your latest lab results. Everything...",
    time: "Just Now",
    online: true,
    initials: "AJ",
    initialsColor: "bg-primary/10 text-primary",
  },
  {
    id: 2,
    name: "Marcus Chen",
    role: "Medical Assistant",
    preview: "The prescription has been sent to your local...",
    time: "2h Ago",
    online: false,
    initials: "MC",
    initialsColor: "bg-muted text-muted-foreground",
  },
  {
    id: 3,
    name: "Care Concierge",
    role: "Customer Support",
    preview: "Your insurance verification for the upcoming visi...",
    time: "Yesterday",
    online: false,
    initials: "CC",
    initialsColor: "bg-accent text-primary",
  },
];

const filterTabs = [
  { label: "Support", icon: HelpCircle },
  { label: "Assistant", icon: Bot },
  { label: "Provider", icon: User },
];

const messages = [
  {
    id: 1,
    sender: "provider",
    text: "Hi Taylor, I've had a chance to look over your bloodwork from Monday. Your vitamin D levels are slightly low, but everything else is within the optimal range.",
    time: "04:32 PM",
    day: "Yesterday",
  },
  {
    id: 2,
    sender: "user",
    text: "Thanks for the update, April! Should I start taking a supplement, or try to adjust my diet first?",
    time: "04:45 PM",
  },
  {
    id: 3,
    sender: "provider",
    text: 'I would recommend a 2000 IU supplement daily for the next three months. I\'ve sent a recommendation to your patient portal "Files" section for brands I trust. Does that sound manageable?',
    time: "09:15 AM",
    day: "Today",
  },
];

const MessagesContent = () => {
  const [activeConversation, setActiveConversation] = useState(1);
  const activeContact = conversations.find((c) => c.id === activeConversation)!;

  return (
    <main className="flex-1 flex overflow-hidden">
      {/* Conversation List */}
      <div className="w-full max-w-xs border-r bg-card flex flex-col hidden md:flex">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-foreground mb-3">Messages</h2>
          <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
          <div className="flex items-center gap-2 mt-3">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.label}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Icon className="h-3 w-3" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((convo) => (
            <button
              key={convo.id}
              onClick={() => setActiveConversation(convo.id)}
              className={`w-full flex items-start gap-3 p-4 text-left transition-colors ${
                activeConversation === convo.id
                  ? "bg-accent border-l-2 border-primary"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className={`h-10 w-10 rounded-full ${convo.initialsColor} flex items-center justify-center text-xs font-bold`}>
                  {convo.initials}
                </div>
                {convo.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-card" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground truncate">{convo.name}</p>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex-shrink-0 ml-2">{convo.time}</span>
                </div>
                <p className="text-xs text-muted-foreground">{convo.role}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{convo.preview}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`h-10 w-10 rounded-full ${activeContact.initialsColor} flex items-center justify-center text-xs font-bold`}>
                {activeContact.initials}
              </div>
              {activeContact.online && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-card" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{activeContact.name}</p>
              <div className="flex items-center gap-2">
                {activeContact.online && <span className="text-xs font-medium text-success">Online</span>}
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  M-F 8am - 6pm
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
              <Video className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.day && (
                <div className="flex justify-center mb-4">
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-card">
                    {msg.day}
                  </Badge>
                </div>
              )}
              <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} mb-1`}>
                <div className={`max-w-md ${msg.sender === "user" ? "order-1" : ""}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "border bg-card text-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className={`flex items-center gap-2 mt-1 ${msg.sender === "user" ? "justify-end" : ""}`}>
                    {msg.sender === "provider" && (
                      <div className={`h-6 w-6 rounded-full ${activeContact.initialsColor} flex items-center justify-center text-[8px] font-bold`}>
                        {activeContact.initials}
                      </div>
                    )}
                    <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                    {msg.sender === "user" && (
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-[8px] font-bold text-primary-foreground">
                        TC
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* HIPAA notice */}
          <div className="flex justify-center pt-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              This conversation is encrypted and HIPAA compliant.
            </span>
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t px-5 py-3">
          <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2">
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <Plus className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <Image className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center hover:opacity-90 transition-opacity">
              <Send className="h-4 w-4 text-primary-foreground" />
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Use messages for non-emergency medical concerns only. For emergencies, call 911.
          </p>
        </div>
      </div>
    </main>
  );
};

export default MessagesContent;
