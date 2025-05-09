'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, User, ArrowRight, Send, ChevronLeft, ArrowDown, Sparkles } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api/trpc/client';

// Interface for chat messages
interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Suggested questions or prompts for the AI assistant
const suggestedQuestions = [
  "What's a good pre-workout meal?",
  "How can I improve my sleep quality?",
  "What exercises are best for lower back pain?",
  "How much water should I drink daily?",
  "Is intermittent fasting right for me?",
  "How can I reduce stress naturally?",
  "What are some high-protein vegetarian meals?",
  "How often should I change my workout routine?",
  "What are the best stretches for office workers?",
  "How can I stay motivated with my fitness goals?",
];

/**
 * Better Me Assistant Page
 * AI-powered chat assistant for health and wellness
 */
export default function BetterMeAssistantPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [includeProfileContext, setIncludeProfileContext] = useState(true);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  
  // Get user's health profile
  const { data: healthProfile, isLoading: isLoadingProfile } = api.betterMe.getProfile.useQuery();
  
  // Chat with assistant mutation
  const chatMutation = api.betterMe.chatWithAssistant.useMutation({
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      setIsAssistantTyping(false);
    },
    onError: (error) => {
      // Add error message from assistant
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'assistant',
        content: `I'm sorry, I encountered an error: ${error.message || 'Something went wrong'}. Please try again later.`,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      setIsAssistantTyping(false);
    },
  });
  
  // Add welcome message when component mounts
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      sender: 'assistant',
      content: "👋 Hi there! I'm your Better Me wellness assistant. I can help with nutrition advice, workout tips, sleep improvement, stress management, and more. How can I assist you with your health journey today?",
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
  }, []);
  
  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Redirect to profile creation if no profile exists
  useEffect(() => {
    if (!isLoadingProfile && !healthProfile) {
      router.push('/better-me/profile');
    }
  }, [healthProfile, isLoadingProfile, router]);
  
  // Send message handler
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: newMessage,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');
    setIsAssistantTyping(true);
    
    // Send message to API
    chatMutation.mutate({
      message: newMessage,
      includeProfileContext,
    });
  };
  
  // Handle sending message on Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Handle suggested question click
  const handleSuggestedQuestion = (question: string) => {
    setNewMessage(question);
    // Automatically send after a short delay
    setTimeout(() => {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        content: question,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, userMessage]);
      setNewMessage('');
      setIsAssistantTyping(true);
      
      chatMutation.mutate({
        message: question,
        includeProfileContext,
      });
    }, 300);
  };
  
  if (isLoadingProfile) {
    return (
      <MainLayout>
        <div className="container max-w-4xl py-8">
          <div className="flex flex-col gap-6 animate-pulse">
            <div className="h-10 w-64 bg-muted rounded" />
            <div className="h-[600px] bg-muted rounded" />
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (!healthProfile) {
    return null; // Will redirect in the useEffect
  }
  
  return (
    <MainLayout>
      <div className="container max-w-4xl py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" /> Better Me Assistant
          </h1>
        </div>
        
        <Card className="border-2 mb-6">
          <CardContent className="p-0">
            {/* Chat header with assistant info */}
            <div className="border-b p-4 flex items-center gap-3">
              <Avatar className="h-10 w-10 bg-primary/10">
                <AvatarImage src="/images/assistant-avatar.png" alt="AI Assistant" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Brain className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Health & Wellness Assistant</p>
                <p className="text-xs text-muted-foreground">
                  Powered by AI • Personalized guidance
                </p>
              </div>
            </div>
            
            {/* Chat messages area */}
            <div className="h-[500px] overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.sender === 'user' 
                          ? 'bg-primary text-primary-foreground ml-4' 
                          : 'bg-muted mr-4'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {message.sender === 'assistant' ? (
                          <>
                            <Brain className="h-4 w-4" />
                            <span className="text-xs font-medium">Better Me Assistant</span>
                          </>
                        ) : (
                          <>
                            <User className="h-4 w-4" />
                            <span className="text-xs font-medium">You</span>
                          </>
                        )}
                      </div>
                      <div className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </div>
                      <div className="text-right mt-1">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Assistant typing indicator */}
                {isAssistantTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-muted mr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="h-4 w-4" />
                        <span className="text-xs font-medium">Better Me Assistant</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-2 w-2 rounded-full animate-bounce" />
                        <Skeleton className="h-2 w-2 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <Skeleton className="h-2 w-2 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* This div is for scrolling to the bottom */}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Suggested questions */}
            {messages.length <= 2 && (
              <div className="border-t p-4">
                <p className="text-sm font-medium mb-3">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.slice(0, 5).map((question) => (
                    <Button
                      key={question}
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      {question}
                    </Button>
                  ))}
                  
                  {suggestedQuestions.length > 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        // Rotate suggestions
                        const rotated = [...suggestedQuestions];
                        rotated.push(rotated.shift()!);
                        // This would update the suggested questions array in a real app
                      }}
                    >
                      <ArrowDown className="h-4 w-4 mr-1" /> More
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {/* Message input area */}
            <div className="border-t p-4">
              <div className="flex items-center gap-2 mb-3">
                <Checkbox
                  id="includeProfile"
                  checked={includeProfileContext}
                  onCheckedChange={(checked) => setIncludeProfileContext(checked as boolean)}
                />
                <Label htmlFor="includeProfile" className="text-sm cursor-pointer flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Include my health profile for personalized responses
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="rounded-full"
                  disabled={isAssistantTyping || chatMutation.isPending}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isAssistantTyping || chatMutation.isPending}
                  size="icon"
                  className="rounded-full h-10 w-10 flex-shrink-0"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                AI responses are generated based on general health knowledge and your profile information.
                For medical concerns, always consult a healthcare professional.
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Additional features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 flex flex-col items-center text-center space-y-2">
            <Brain className="h-6 w-6 text-primary" />
            <h3 className="font-medium">Nutrition Advice</h3>
            <p className="text-sm text-muted-foreground">Ask about healthy eating and meal planning</p>
          </Card>
          
          <Card className="p-4 flex flex-col items-center text-center space-y-2">
            <Activity className="h-6 w-6 text-primary" />
            <h3 className="font-medium">Fitness Guidance</h3>
            <p className="text-sm text-muted-foreground">Get exercise recommendations and techniques</p>
          </Card>
          
          <Card className="p-4 flex flex-col items-center text-center space-y-2">
            <Brain className="h-6 w-6 text-primary" />
            <h3 className="font-medium">Wellness Tips</h3>
            <p className="text-sm text-muted-foreground">Learn about sleep, stress management, and more</p>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}