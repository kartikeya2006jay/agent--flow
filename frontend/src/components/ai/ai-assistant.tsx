'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Send, Loader2, Bot, Sparkles, X, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  action?: string
}

export function AIAssistant() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const speechSynth = useRef<SpeechSynthesis>(null)

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  const isSupported = !!SpeechRecognition

  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) 
  }, [messages])

  useEffect(() => {
    speechSynth.current = window.speechSynthesis
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: '👋 Hello! I am your AI assistant. You can speak or type to execute workflows, ask questions, or navigate.\n\nTry:\n• "approve refund for order 12345"\n• "what are approval thresholds?"\n• "show workflows"',
        timestamp: new Date(),
      }])
    }
  }, [isOpen])

  const speak = (text: string) => {
    if (!isMuted && speechSynth.current) {
      speechSynth.current.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.pitch = 1
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      setIsSpeaking(true)
      speechSynth.current.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if (speechSynth.current) {
      speechSynth.current.cancel()
      setIsSpeaking(false)
    }
  }

  const callOpenAI = async (message: string) => {
    try {
      const response = await fetch('/api/rag/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, domain: 'assistant', conversationHistory: messages.slice(-5) }),
      })
      const data = await response.json()
      return data.reply
    } catch {
      return null
    }
  }

  const processCommand = async (command: string) => {
    if (!command.trim()) return
    
    setIsProcessing(true)
    const lowerCommand = command.toLowerCase()

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: command, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])

    try {
      let response = ''
      let action = null

      if (lowerCommand.includes('approve') && lowerCommand.includes('refund')) {
        action = 'approve_refund'
        const orderMatch = command.match(/(\d+)/)
        const orderId = orderMatch ? `ORD-${orderMatch[1]}` : `ORD-${Date.now()}`
        const workflow = {
          id: `wf_${Date.now()}`,
          action_id: 'approve_refund',
          action_name: 'Approve Refund',
          status: 'success',
          progress: 100,
          created_at: new Date().toISOString(),
          trace_id: `trace_${Date.now()}`,
          result: { order_id: orderId },
          policy_decision: 'ALLOW',
          risk_score: 25,
        }
        const existing = JSON.parse(localStorage.getItem('agentflow_workflows') || '[]')
        existing.unshift(workflow)
        localStorage.setItem('agentflow_workflows', JSON.stringify(existing))
        window.dispatchEvent(new Event('storage'))
        response = `✅ Refund approved for ${orderId}. Workflow ID: ${workflow.id}.`
        speak(response)
        setTimeout(() => router.push('/workflows'), 2000)
      }
      else if (lowerCommand.includes('create') && lowerCommand.includes('ticket')) {
        action = 'create_ticket'
        const workflow = {
          id: `wf_${Date.now()}`,
          action_id: 'create_ticket',
          action_name: 'Create Ticket',
          status: 'success',
          progress: 100,
          created_at: new Date().toISOString(),
          trace_id: `trace_${Date.now()}`,
          result: { ticket_id: `TKT-${Date.now()}` },
          policy_decision: 'ALLOW',
          risk_score: 15,
        }
        const existing = JSON.parse(localStorage.getItem('agentflow_workflows') || '[]')
        existing.unshift(workflow)
        localStorage.setItem('agentflow_workflows', JSON.stringify(existing))
        window.dispatchEvent(new Event('storage'))
        response = `✅ Ticket created: ${workflow.result.ticket_id}`
        speak(response)
        setTimeout(() => router.push('/workflows'), 2000)
      }
      else if (lowerCommand.includes('onboard') && lowerCommand.includes('employee')) {
        action = 'onboard_employee'
        response = `✅ Employee onboarding initiated. Requires HR and IT/Ops approval.`
        speak(response)
        setTimeout(() => router.push('/workflows'), 2000)
      }
      else if (lowerCommand.includes('show') && lowerCommand.includes('workflow')) {
        response = `📊 Opening workflows page.`
        speak(response)
        setTimeout(() => router.push('/workflows'), 1500)
      }
      else if (lowerCommand.includes('show') && lowerCommand.includes('audit')) {
        response = `📋 Opening audit logs.`
        speak(response)
        setTimeout(() => router.push('/audit'), 1500)
      }
      else if (lowerCommand.includes('show') && lowerCommand.includes('agent')) {
        response = `🤖 Opening agent library.`
        speak(response)
        setTimeout(() => router.push('/agents'), 1500)
      }
      else if (lowerCommand.includes('how many') && lowerCommand.includes('action')) {
        const custom = JSON.parse(localStorage.getItem('agentflow_custom_actions') || '[]').length
        response = `You have ${custom} custom actions plus 5 built-in. Total: ${custom + 5} actions.`
        speak(response)
      }
      else if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
        response = `👋 Hello! I am your AgentFlow AI assistant. I can execute workflows, answer questions, or help you navigate. What would you like to do?`
        speak(response)
      }
      else if (lowerCommand.includes('help')) {
        response = `I can help you with:\n\n1. Execute: "approve refund for order 123"\n2. Create: "create ticket"\n3. Navigate: "show workflows", "show audit"\n4. Questions: "what are approval thresholds?"\n5. Status: "how many actions do I have?"`
        speak(response)
      }
      else {
        const aiResponse = await callOpenAI(command)
        response = aiResponse || `I can help with: approve refund, create ticket, show workflows/audit/agents, or answer policy questions. Try "help" for more commands.`
        speak(response)
      }

      const assistantMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: response, 
        timestamp: new Date(),
        action: action || undefined
      }
      setMessages(prev => [...prev, assistantMsg])

    } catch (err: any) {
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: `❌ Error: ${err.message}`, 
        timestamp: new Date() 
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsProcessing(false)
    }
  }

  const startListening = () => {
    if (!isSupported) {
      const errorMsg: Message = { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: 'Voice not supported. Please use Chrome or type your message.', 
        timestamp: new Date() 
      }
      setMessages(prev => [...prev, errorMsg])
      return
    }
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.onstart = () => { setIsListening(true); stopSpeaking() }
    recognition.onresult = (event: any) => {
      const current = event.resultIndex
      const transcript = event.results[current][0].transcript
      if (event.results[current].isFinal) {
        processCommand(transcript)
      }
    }
    recognition.onerror = () => { setIsListening(false) }
    recognition.onend = () => { setIsListening(false) }
    recognition.start()
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return
    processCommand(inputText)
    setInputText('')
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button 
        whileHover={{scale:1.05}} 
        whileTap={{scale:0.95}} 
        onClick={() => setIsOpen(true)} 
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
      >
        <Bot className="h-5 w-5"/>
        <span className="hidden sm:inline text-sm font-medium">AI Assistant</span>
      </motion.button>

      {/* Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{opacity:0,y:20,scale:0.95}} 
            animate={{opacity:1,y:0,scale:1}} 
            exit={{opacity:0,y:20,scale:0.95}} 
            className="fixed bottom-20 right-6 z-50 w-96 sm:w-[450px]"
          >
            <Card className="shadow-2xl border-2 border-slate-200">
              {/* Header */}
              <CardHeader className="pb-3 flex flex-row items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-lg"><Sparkles className="h-5 w-5"/></div>
                  <CardTitle className="text-sm font-semibold">AI Assistant</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setIsMuted(!isMuted)} className="p-1.5 hover:bg-white/20 rounded-lg" title={isMuted ? 'Unmute' : 'Mute'}>
                    {isMuted ? <VolumeX className="h-4 w-4"/> : <Volume2 className="h-4 w-4"/>}
                  </button>
                  <button onClick={() => {setIsOpen(false); stopSpeaking()}} className="p-1.5 hover:bg-white/20 rounded-lg">
                    <X className="h-4 w-4"/>
                  </button>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="p-0">
                <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-50">
                  {messages.map((msg) => (
                    <motion.div 
                      key={msg.id} 
                      initial={{opacity:0,y:10}} 
                      animate={{opacity:1,y:0}} 
                      className={`flex gap-2 ${msg.role==='user'?'flex-row-reverse':''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role==='user'?'bg-blue-600 text-white':'bg-purple-600 text-white'}`}>
                        {msg.role==='user'?'👤':'🤖'}
                      </div>
                      <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role==='user'?'bg-blue-600 text-white':'bg-white border border-slate-200 shadow-sm'}`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.role==='user'?'text-blue-100':'text-slate-400'}`}>
                          {msg.timestamp.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isListening && (
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">🤖</div>
                      <div className="bg-white border border-slate-200 rounded-2xl p-3">
                        <Mic className="h-4 w-4 animate-pulse text-purple-600"/>
                      </div>
                    </div>
                  )}
                  
                  {isProcessing && (
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">🤖</div>
                      <div className="bg-white border border-slate-200 rounded-2xl p-3">
                        <Loader2 className="h-4 w-4 animate-spin text-purple-600"/>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef}/>
                </div>

                {/* Input Area - BOTH Voice + Text */}
                <div className="p-3 border-t border-slate-200 bg-white space-y-2">
                  {/* Voice + Stop Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={startListening} 
                      disabled={isListening||isProcessing} 
                      className={`flex-1 ${isListening?'bg-red-600 hover:bg-red-700':'bg-purple-600 hover:bg-purple-700'}`}
                    >
                      {isListening ? <><MicOff className="h-4 w-4 mr-2"/>Listening...</> : <><Mic className="h-4 w-4 mr-2"/>Speak</>}
                    </Button>
                    {isSpeaking && (
                      <Button onClick={stopSpeaking} variant="outline" className="flex-1">
                        🔇 Stop Speech
                      </Button>
                    )}
                  </div>
                  
                  {/* Text Input */}
                  <form onSubmit={handleTextSubmit} className="flex gap-2">
                    <Input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 h-10"
                      disabled={isListening||isProcessing}
                    />
                    <Button 
                      type="submit" 
                      disabled={isProcessing||!inputText.trim()} 
                      className="bg-blue-600 hover:bg-blue-700 h-10"
                    >
                      <Send className="h-4 w-4"/>
                    </Button>
                  </form>
                  
                  {/* Helper Text */}
                  <p className="text-xs text-slate-500 text-center">
                    💬 Type or 🎤 speak: "approve refund for order 123" • "show workflows" • "what are approval thresholds?"
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
