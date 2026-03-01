'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Send, Loader2, Bot, Sparkles, X, Volume2, VolumeX, Play, Pause, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
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
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [currentDemoStep, setCurrentDemoStep] = useState(0)
  const [demoProgress, setDemoProgress] = useState(0)
  const [mounted, setMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const demoTimerRef = useRef<any>(null)
  const isDemoRunningRef = useRef(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    if (mounted && isOpen && messages.length === 0 && !isDemoMode) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: '👋 Hello! I am your AI assistant.\n\n💡 Click "Start Demo" for a 60-second automated tour!\n\nOr ask me to:\n• approve refund for order 12345\n• create ticket for customer\n• issue payment to vendor\n• show workflows',
        timestamp: new Date(),
      }])
    }
  }, [isOpen, isDemoMode, mounted])

  const speak = (text: string) => {
    if (!isMuted && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      setIsSpeaking(true)
      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const callOpenAI = async (message: string) => {
    try {
      const response = await fetch('/api/rag/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, domain: 'assistant' }),
      })
      const data = await response.json()
      return data.reply
    } catch { return null }
  }

  const processCommand = async (command: string) => {
    if (!command.trim()) return
    setIsProcessing(true)
    const lowerCommand = command.toLowerCase()
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: command, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])

    try {
      let response = ''
      let actionId = ''
      let actionName = ''

      // ✅ APPROVE REFUND
      if (lowerCommand.includes('approve') && lowerCommand.includes('refund')) {
        actionId = 'approve_refund'
        actionName = 'Approve Refund'
        const orderMatch = command.match(/(\d+)/)
        const orderId = orderMatch ? `ORD-${orderMatch[1]}` : `ORD-${Date.now()}`
        const workflow = {
          id: `wf_${Date.now()}`,
          action_id: actionId,
          action_name: actionName,
          status: 'success',
          progress: 100,
          created_at: new Date().toISOString(),
          trace_id: `trace_${Date.now()}`,
          result: { order_id: orderId, type: 'refund' },
          policy_decision: 'ALLOW',
          risk_score: 25,
        }
        if (typeof window !== 'undefined') {
          const existing = JSON.parse(localStorage.getItem('agentflow_workflows') || '[]')
          existing.unshift(workflow)
          localStorage.setItem('agentflow_workflows', JSON.stringify(existing))
          const audit = {
            id: `audit_${Date.now()}`,
            trace_id: workflow.trace_id,
            workflow_id: workflow.id,
            action_id: actionId,
            action_name: actionName,
            user_id: 'voice_user',
            status: 'success',
            policy_decision: 'ALLOW',
            risk_score: 25,
            created_at: new Date().toISOString(),
            details: { order_id: orderId, type: 'refund' }
          }
          const existingAudit = JSON.parse(localStorage.getItem('agentflow_audit_logs') || '[]')
          existingAudit.unshift(audit)
          localStorage.setItem('agentflow_audit_logs', JSON.stringify(existingAudit))
          window.dispatchEvent(new Event('storage'))
        }
        response = `✅ ${actionName} for ${orderId}. Workflow: ${workflow.id}`
        speak(response)
        setTimeout(() => router.push('/workflows'), 2000)
      }
      // ✅ CREATE TICKET
      else if (lowerCommand.includes('create') && lowerCommand.includes('ticket')) {
        actionId = 'create_ticket'
        actionName = 'Create Ticket'
        const workflow = {
          id: `wf_${Date.now()}`,
          action_id: actionId,
          action_name: actionName,
          status: 'success',
          progress: 100,
          created_at: new Date().toISOString(),
          trace_id: `trace_${Date.now()}`,
          result: { ticket_id: `TKT-${Date.now()}`, type: 'support' },
          policy_decision: 'ALLOW',
          risk_score: 15,
        }
        if (typeof window !== 'undefined') {
          const existing = JSON.parse(localStorage.getItem('agentflow_workflows') || '[]')
          existing.unshift(workflow)
          localStorage.setItem('agentflow_workflows', JSON.stringify(existing))
          const audit = {
            id: `audit_${Date.now()}`,
            trace_id: workflow.trace_id,
            workflow_id: workflow.id,
            action_id: actionId,
            action_name: actionName,
            user_id: 'voice_user',
            status: 'success',
            policy_decision: 'ALLOW',
            risk_score: 15,
            created_at: new Date().toISOString(),
            details: { ticket_id: workflow.result.ticket_id, type: 'support' }
          }
          const existingAudit = JSON.parse(localStorage.getItem('agentflow_audit_logs') || '[]')
          existingAudit.unshift(audit)
          localStorage.setItem('agentflow_audit_logs', JSON.stringify(existingAudit))
          window.dispatchEvent(new Event('storage'))
        }
        response = `✅ ${actionName}: ${workflow.result.ticket_id}`
        speak(response)
        setTimeout(() => router.push('/workflows'), 2000)
      }
      // ✅ ISSUE PAYMENT
      else if (lowerCommand.includes('issue') && lowerCommand.includes('payment')) {
        actionId = 'issue_payment'
        actionName = 'Issue Payment'
        const workflow = {
          id: `wf_${Date.now()}`,
          action_id: actionId,
          action_name: actionName,
          status: 'success',
          progress: 100,
          created_at: new Date().toISOString(),
          trace_id: `trace_${Date.now()}`,
          result: { payment_id: `PAY-${Date.now()}`, type: 'vendor_payment' },
          policy_decision: 'ALLOW',
          risk_score: 75,
        }
        if (typeof window !== 'undefined') {
          const existing = JSON.parse(localStorage.getItem('agentflow_workflows') || '[]')
          existing.unshift(workflow)
          localStorage.setItem('agentflow_workflows', JSON.stringify(existing))
          const audit = {
            id: `audit_${Date.now()}`,
            trace_id: workflow.trace_id,
            workflow_id: workflow.id,
            action_id: actionId,
            action_name: actionName,
            user_id: 'voice_user',
            status: 'success',
            policy_decision: 'ALLOW',
            risk_score: 75,
            created_at: new Date().toISOString(),
            details: { payment_id: workflow.result.payment_id, type: 'vendor_payment' }
          }
          const existingAudit = JSON.parse(localStorage.getItem('agentflow_audit_logs') || '[]')
          existingAudit.unshift(audit)
          localStorage.setItem('agentflow_audit_logs', JSON.stringify(existingAudit))
          window.dispatchEvent(new Event('storage'))
        }
        response = `✅ ${actionName}: ${workflow.result.payment_id} (HIGH RISK)`
        speak(response)
        setTimeout(() => router.push('/workflows'), 2000)
      }
      // ✅ ONBOARD EMPLOYEE
      else if (lowerCommand.includes('onboard') && lowerCommand.includes('employee')) {
        actionId = 'onboard_employee'
        actionName = 'Onboard Employee'
        const workflow = {
          id: `wf_${Date.now()}`,
          action_id: actionId,
          action_name: actionName,
          status: 'success',
          progress: 100,
          created_at: new Date().toISOString(),
          trace_id: `trace_${Date.now()}`,
          result: { employee_id: `EMP-${Date.now()}`, type: 'onboarding' },
          policy_decision: 'ALLOW',
          risk_score: 35,
        }
        if (typeof window !== 'undefined') {
          const existing = JSON.parse(localStorage.getItem('agentflow_workflows') || '[]')
          existing.unshift(workflow)
          localStorage.setItem('agentflow_workflows', JSON.stringify(existing))
          window.dispatchEvent(new Event('storage'))
        }
        response = `✅ ${actionName}: ${workflow.result.employee_id}`
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
      else if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
        response = `👋 Hello! I am your AgentFlow AI assistant. Click "Start Demo" for a 60-second tour!`
        speak(response)
      }
      else if (lowerCommand.includes('demo') || lowerCommand.includes('tour')) {
        startDemoMode()
        return
      }
      else {
        const aiResponse = await callOpenAI(command)
        response = aiResponse || `I can help execute workflows. Try: "approve refund", "create ticket", "issue payment", or "start demo"`
        speak(response)
      }

      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: new Date() }
      setMessages(prev => [...prev, assistantMsg])

    } catch (err: any) {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: `❌ Error: ${err.message}`, timestamp: new Date() }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsProcessing(false)
    }
  }

  const runDemoStep = (step: number) => {
    if (!isDemoRunningRef.current) return
    switch(step) {
      case 0:
        router.push('/dashboard')
        setMessages(prev => [...prev, { id: `demo_0`, role: 'assistant', content: '🏠 **Step 1/6: Dashboard**\n\nYour command center with metrics.\n\nMoving to workflow execution...', timestamp: new Date() }])
        speak('Step 1: Dashboard')
        setDemoProgress(17)
        break
      case 1:
        const workflow = { id: `wf_demo_${Date.now()}`, action_id: 'approve_refund', action_name: 'Approve Refund', status: 'success', progress: 100, created_at: new Date().toISOString(), trace_id: `trace_demo_${Date.now()}`, result: { order_id: 'ORD-DEMO-001' }, policy_decision: 'ALLOW', risk_score: 25 }
        if (typeof window !== 'undefined') {
          const existing = JSON.parse(localStorage.getItem('agentflow_workflows') || '[]')
          existing.unshift(workflow)
          localStorage.setItem('agentflow_workflows', JSON.stringify(existing))
          const audit = { id: `audit_demo_${Date.now()}`, trace_id: workflow.trace_id, workflow_id: workflow.id, action_id: 'approve_refund', action_name: 'Approve Refund', user_id: 'demo_user', status: 'success', policy_decision: 'ALLOW', risk_score: 25, created_at: new Date().toISOString(), details: { demo: true } }
          const existingAudit = JSON.parse(localStorage.getItem('agentflow_audit_logs') || '[]')
          existingAudit.unshift(audit)
          localStorage.setItem('agentflow_audit_logs', JSON.stringify(existingAudit))
          window.dispatchEvent(new Event('storage'))
        }
        setMessages(prev => [...prev, { id: `demo_1`, role: 'assistant', content: '🤖 **Step 2/6: Workflow Executed**\n\nApprove Refund for ORD-DEMO-001\n\nMoving to workflows...', timestamp: new Date() }])
        speak('Step 2: Workflow executed')
        setDemoProgress(33)
        break
      case 2:
        router.push('/workflows')
        setMessages(prev => [...prev, { id: `demo_2`, role: 'assistant', content: '📊 **Step 3/6: Workflows**\n\nReal-time status and tracking.\n\nMoving to audit logs...', timestamp: new Date() }])
        speak('Step 3: Workflows page')
        setDemoProgress(50)
        break
      case 3:
        router.push('/audit')
        setMessages(prev => [...prev, { id: `demo_3`, role: 'assistant', content: '📋 **Step 4/6: Audit Logs**\n\nImmutable compliance trail.\n\nMoving to orchestration...', timestamp: new Date() }])
        speak('Step 4: Audit logs')
        setDemoProgress(67)
        break
      case 4:
        router.push('/orchestration')
        setMessages(prev => [...prev, { id: `demo_4`, role: 'assistant', content: '🕸️ **Step 5/6: Orchestration**\n\nLive agent network visualization.\n\nMoving to AI Assistant...', timestamp: new Date() }])
        speak('Step 5: Orchestration')
        setDemoProgress(83)
        break
      case 5:
        router.push('/dashboard')
        setMessages(prev => [...prev, { id: `demo_5`, role: 'assistant', content: '🤖 **Step 6/6: AI Assistant**\n\nVoice + Chat enabled.\n\n🎉 **DEMO COMPLETE!**\n\nAgentFlow OS is ready!', timestamp: new Date() }])
        speak('Demo complete! AgentFlow OS is ready!')
        setDemoProgress(100)
        break
    }
  }

  const startDemoMode = () => {
    setIsDemoMode(true)
    setCurrentDemoStep(0)
    setDemoProgress(0)
    setIsOpen(true)
    isDemoRunningRef.current = true
    stopSpeaking()
    setMessages([{ id: 'demo_start', role: 'assistant', content: '🎬 **Starting 60-Second Demo Tour**', timestamp: new Date() }])
    speak('Starting 60-second demo tour')
    runDemoStep(0)
  }

  useEffect(() => {
    if (isDemoMode && isDemoRunningRef.current && mounted) {
      demoTimerRef.current = setTimeout(() => {
        if (currentDemoStep < 5) {
          const nextStep = currentDemoStep + 1
          setCurrentDemoStep(nextStep)
          runDemoStep(nextStep)
        } else {
          setIsDemoMode(false)
          isDemoRunningRef.current = false
          setCurrentDemoStep(0)
          setDemoProgress(100)
        }
      }, 10000)
    }
    return () => { if (demoTimerRef.current) clearTimeout(demoTimerRef.current) }
  }, [isDemoMode, currentDemoStep, mounted])

  const pauseDemo = () => { isDemoRunningRef.current = false; if (demoTimerRef.current) clearTimeout(demoTimerRef.current); setIsDemoMode(false); stopSpeaking() }
  const skipDemoStep = () => { if (demoTimerRef.current) clearTimeout(demoTimerRef.current); if (currentDemoStep < 5) { const nextStep = currentDemoStep + 1; setCurrentDemoStep(nextStep); isDemoRunningRef.current = true; setIsDemoMode(true); runDemoStep(nextStep) } }
  const stopDemo = () => { isDemoRunningRef.current = false; if (demoTimerRef.current) clearTimeout(demoTimerRef.current); setIsDemoMode(false); setCurrentDemoStep(0); setDemoProgress(0); stopSpeaking() }

  const startListening = () => {
    if (!mounted) return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Voice not supported. Use Chrome or type.', timestamp: new Date() }])
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
      if (event.results[current].isFinal) processCommand(transcript)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognition.start()
  }

  const handleTextSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!inputText.trim()) return; processCommand(inputText); setInputText('') }

  if (!mounted) return null

  return (
    <>
      <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
        <Bot className="h-5 w-5"/><span className="hidden sm:inline text-sm font-medium">AI Assistant</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{opacity:0,y:20,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:20,scale:0.95}} className="fixed bottom-20 right-6 z-50 w-96 sm:w-[450px]">
            <Card className="shadow-2xl border-2 border-slate-200">
              <CardHeader className="pb-3 flex flex-row items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-2xl">
                <div className="flex items-center gap-2"><div className="p-1.5 bg-white/20 rounded-lg"><Sparkles className="h-5 w-5"/></div><CardTitle className="text-sm font-semibold">AI Assistant</CardTitle></div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setIsMuted(!isMuted)} className="p-1.5 hover:bg-white/20 rounded-lg">{isMuted ? <VolumeX className="h-4 w-4"/> : <Volume2 className="h-4 w-4"/>}</button>
                  <button onClick={() => {setIsOpen(false); stopSpeaking(); stopDemo()}} className="p-1.5 hover:bg-white/20 rounded-lg"><X className="h-4 w-4"/></button>
                </div>
              </CardHeader>

              {isDemoMode && (
                <div className="px-4 py-2 bg-purple-50 border-b border-purple-200">
                  <div className="flex items-center justify-between mb-1"><span className="text-xs font-semibold text-purple-700">🎬 Demo Tour</span><span className="text-xs text-purple-600">{demoProgress}%</span></div>
                  <div className="h-2 bg-purple-200 rounded-full overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" animate={{ width: `${demoProgress}%` }} transition={{ duration: 0.5 }}/></div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={pauseDemo} className="flex-1 h-7 text-xs"><Pause className="h-3 w-3 mr-1"/>Pause</Button>
                    <Button size="sm" variant="outline" onClick={skipDemoStep} className="flex-1 h-7 text-xs"><SkipForward className="h-3 w-3 mr-1"/>Skip</Button>
                    <Button size="sm" variant="outline" onClick={stopDemo} className="flex-1 h-7 text-xs"><X className="h-3 w-3 mr-1"/>Stop</Button>
                  </div>
                </div>
              )}

              <CardContent className="p-0">
                <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-50">
                  {messages.map((msg) => (
                    <motion.div key={msg.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className={`flex gap-2 ${msg.role==='user'?'flex-row-reverse':''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role==='user'?'bg-blue-600 text-white':'bg-purple-600 text-white'}`}>{msg.role==='user'?'👤':'🤖'}</div>
                      <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role==='user'?'bg-blue-600 text-white':'bg-white border border-slate-200 shadow-sm'}`}><p className="whitespace-pre-wrap">{msg.content}</p><p className={`text-xs mt-1 ${msg.role==='user'?'text-blue-100':'text-slate-400'}`}>{msg.timestamp.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</p></div>
                    </motion.div>
                  ))}
                  {isListening && (<div className="flex gap-2"><div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">🤖</div><div className="bg-white border border-slate-200 rounded-2xl p-3"><Mic className="h-4 w-4 animate-pulse text-purple-600"/></div></div>)}
                  {isProcessing && (<div className="flex gap-2"><div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">🤖</div><div className="bg-white border border-slate-200 rounded-2xl p-3"><Loader2 className="h-4 w-4 animate-spin text-purple-600"/></div></div>)}
                  <div ref={messagesEndRef}/>
                </div>

                <div className="p-3 border-t border-slate-200 bg-white space-y-2">
                  {!isDemoMode && (<Button onClick={startDemoMode} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white gap-2"><Play className="h-4 w-4"/>🎬 Start 60-Second Demo Tour</Button>)}
                  <div className="flex gap-2">
                    <Button onClick={startListening} disabled={isListening||isProcessing||isDemoMode} className={`flex-1 ${isListening?'bg-red-600':'bg-purple-600'}`}>{isListening ? <><MicOff className="h-4 w-4 mr-2"/>Listening...</> : <><Mic className="h-4 w-4 mr-2"/>Speak</>}</Button>
                    {isSpeaking && (<Button onClick={stopSpeaking} variant="outline" className="flex-1">🔇 Stop</Button>)}
                  </div>
                  <form onSubmit={handleTextSubmit} className="flex gap-2">
                    <Input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type your message..." className="flex-1 h-10" disabled={isListening||isProcessing||isDemoMode}/>
                    <Button type="submit" disabled={isProcessing||!inputText.trim()} className="bg-blue-600 h-10"><Send className="h-4 w-4"/></Button>
                  </form>
                  <p className="text-xs text-slate-500 text-center">💬 Type or 🎤 speak: "approve refund" • "create ticket" • "issue payment" • "start demo"</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
