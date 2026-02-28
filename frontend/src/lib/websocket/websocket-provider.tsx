'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface WorkflowUpdate {
  workflow_id: string
  status: string
  progress: number
  updated_at: string
}

interface WebSocketContextType {
  isConnected: boolean
  subscribe: (workflowId: string, callback: (update: WorkflowUpdate) => void) => () => void
  lastUpdate: WorkflowUpdate | null
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<WorkflowUpdate | null>(null)
  const [callbacks, setCallbacks] = useState<Record<string, Function[]>>({})

  useEffect(() => {
    // Mock WebSocket (replace with real WS in production)
    const mockInterval = setInterval(() => {
      // Simulate workflow progress updates
      const workflows = JSON.parse(localStorage.getItem('workflows') || '[]')
      const running = workflows.find((w: any) => w.status === 'running')
      
      if (running && running.progress < 100) {
        const newProgress = Math.min(100, running.progress + 10)
        running.progress = newProgress
        running.status = newProgress === 100 ? 'completed' : 'running'
        running.updated_at = new Date().toISOString()
        localStorage.setItem('workflows', JSON.stringify(workflows))
        
        const update = {
          workflow_id: running.id,
          status: running.status,
          progress: newProgress,
          updated_at: running.updated_at
        }
        
        setLastUpdate(update)
        // Call all subscribed callbacks
        Object.values(callbacks).flat().forEach(cb => cb(update))
      }
    }, 2000)

    setIsConnected(true)
    return () => clearInterval(mockInterval)
  }, [callbacks])

  const subscribe = (workflowId: string, callback: Function) => {
    setCallbacks(prev => ({
      ...prev,
      [workflowId]: [...(prev[workflowId] || []), callback]
    }))
    return () => {
      setCallbacks(prev => ({
        ...prev,
        [workflowId]: prev[workflowId]?.filter(cb => cb !== callback)
      }))
    }
  }

  return (
    <WebSocketContext.Provider value={{ isConnected, subscribe, lastUpdate }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) throw new Error('useWebSocket must be used within WebSocketProvider')
  return context
}
