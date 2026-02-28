'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Loader2, Bot, User, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RAGChatbotProps {
  domain: string
  placeholder?: string
  compact?: boolean
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function getResponse(q: string): string {
  const question = q.toLowerCase().trim()
  if (/^(hi|hello|hey)/.test(question)) return `👋 Hi! I'm your AgentFlow assistant. Ask me about:\n• Creating custom agents\n• Executing workflows\n• Approval policies\n• Compliance (GDPR, SOX, HIPAA)`
  if (question.includes('agent')) return `🤖 **Agents** are AI workers that execute tasks.\n\n**Available**: Support, HR, Finance, IT/Ops, Sales\n\n**Create custom**: Click "Create Custom Agent" button on dashboard.`
  if (question.includes('workflow')) return `⚙️ **Workflows** are governed agent executions.\n\n**Steps**: Policy Check → Risk Score → Approval → Agent Execute → Audit Log\n\n**View**: Go to /workflows to see all executions.`
  if (question.includes('approve') || question.includes('threshold')) return `✅ **Approval Thresholds**:\n• Low (<$1K): Auto-approve\n• Medium ($1K-$5K): Single approval\n• High (>$5K): Dual approval\n• Critical: Executive approval`
  return `💡 I can help with:\n• Creating custom agents\n• Executing workflows\n• Approval policies\n• Compliance questions\n\nTry: "How do I create an agent?" or "What are approval thresholds?"`
}

export function RAGChatbot({ domain, placeholder = 'Ask about workflows...', compact = false }: RAGChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ id: 'welcome', role: 'assistant', content: `👋 Hi! I'm your ${domain} assistant.\n\nAsk me about:\n• Creating agents\n• Executing workflows\n• Approval policies\n• Compliance`, timestamp: new Date() }])
    }
  }, [isOpen, domain])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: getResponse(userMsg.content), timestamp: new Date() }])
    setIsLoading(false)
  }

  if (compact) {
    return (
      <>
        <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
          <MessageCircle className="h-5 w-5"/><span className="hidden sm:inline text-sm font-medium">Ask AI</span>
        </motion.button>
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{opacity:0,y:20,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:20,scale:0.95}} className="fixed bottom-20 right-6 z-50 w-80 sm:w-96">
              <Card className="shadow-2xl border-2 border-slate-200">
                <CardHeader className="pb-3 flex flex-row items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
                  <div className="flex items-center gap-2"><div className="p-1.5 bg-white/20 rounded-lg"><Bot className="h-5 w-5"/></div><CardTitle className="text-sm font-semibold">{domain} Assistant</CardTitle></div>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 hover:bg-white/20 text-white"><X className="h-4 w-4"/></Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-50">
                    <AnimatePresence>
                      {messages.map((msg) => (
                        <motion.div key={msg.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className={`flex gap-2 ${msg.role==='user'?'flex-row-reverse':''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role==='user'?'bg-blue-600 text-white':'bg-slate-200'}`}>{msg.role==='user'?<User className="h-4 w-4"/>:<Bot className="h-4 w-4"/>}</div>
                          <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role==='user'?'bg-blue-600 text-white':'bg-white border border-slate-200 shadow-sm'}`}><p className="whitespace-pre-wrap">{msg.content}</p><p className={`text-xs mt-1 ${msg.role==='user'?'text-blue-100':'text-slate-400'}`}>{msg.timestamp.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</p></div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {isLoading && <div className="flex gap-2"><div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center"><Bot className="h-4 w-4"/></div><div className="bg-white border border-slate-200 rounded-2xl p-3"><Loader2 className="h-4 w-4 animate-spin"/></div></div>}
                    <div ref={messagesEndRef}/>
                  </div>
                  <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-white">
                    <div className="flex gap-2">
                      <textarea value={input} onChange={(e)=>setInput(e.target.value)} placeholder={placeholder} className="flex-1 min-h-[40px] max-h-24 px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" disabled={isLoading} onKeyDown={(e)=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSubmit(e)}}}/>
                      <Button type="submit" size="icon" disabled={isLoading||!input.trim()} className="flex-shrink-0 bg-blue-600 hover:bg-blue-700">{isLoading?<Loader2 className="h-4 w-4 animate-spin"/>:<Send className="h-4 w-4"/>}</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }
  return null
}
