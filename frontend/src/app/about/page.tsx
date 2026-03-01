'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bot, Shield, Zap, CheckCircle, ArrowLeft, Users, Clock, Award, Globe, Activity, FileText, Mic, Play } from 'lucide-react'

export default function AboutPage() {
  const router = useRouter()

  const features = [
    { icon: Zap, title: '5+ Pre-built Agents', desc: 'Support, HR, Finance, IT/Ops, Sales + Custom' },
    { icon: Shield, title: 'Policy Enforcement', desc: 'Every action evaluated against enterprise policies' },
    { icon: FileText, title: 'Audit Trails', desc: 'Immutable logs with trace IDs for compliance' },
    { icon: Activity, title: 'Live Orchestration', desc: 'Real-time multi-agent network visualization' },
    { icon: Mic, title: 'Voice Commands', desc: 'Execute workflows via voice or chat' },
    { icon: Play, title: '60s Auto Demo', desc: 'Automated platform tour with narration' },
  ]

  const stats = [
    { value: '5+', label: 'Agents', icon: Users },
    { value: '100%', label: 'Compliant', icon: CheckCircle },
    { value: '60s', label: 'Demo Time', icon: Clock },
    { value: '24/7', label: 'Availability', icon: Globe },
  ]

  const compliance = ['GDPR', 'SOX', 'HIPAA', 'PCI-DSS', 'SOC2', 'ISO27001']

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push('/login')} className="gap-1">
              <ArrowLeft className="h-4 w-4"/>Back to Login
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
                <Bot className="h-5 w-5 text-white"/>
              </div>
              <div>
                <h1 className="text-xl font-bold">AgentFlow OS</h1>
                <p className="text-xs text-slate-500">Governed AI Agent Orchestration</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push('/login')}>Sign In</Button>
            <Button onClick={() => router.push('/login')} className="bg-blue-600 text-white">Get Started</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 space-y-12">
        {/* Hero */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30">
            <Bot className="h-12 w-12 text-white"/>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
            Governed AI Agent Orchestration
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Enterprise-grade platform for safe deployment of AI agent swarms with policy enforcement, 
            human-in-loop approval, and immutable audit trails.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push('/login')} className="bg-blue-600 text-white px-8 h-12 text-lg">
              Start Free Trial
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')} className="h-12 text-lg">
              View Demo
            </Button>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="card text-center">
              <CardContent className="p-6">
                <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-3"/>
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Features */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Key Features</h2>
            <p className="text-slate-600 mt-2">Everything you need for governed AI at enterprise scale</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="card hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="p-3 rounded-xl bg-blue-100 w-fit">
                    <feature.icon className="h-6 w-6 text-blue-600"/>
                  </div>
                  <CardTitle className="text-lg mt-3">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Compliance */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Compliance Ready</h2>
            <p className="text-slate-600 mt-2">Built for enterprise security and regulatory requirements</p>
          </div>
          <Card className="card">
            <CardContent className="p-8">
              <div className="flex flex-wrap justify-center gap-3">
                {compliance.map((std) => (
                  <Badge key={std} className="bg-green-100 text-green-800 border-green-200 px-4 py-2 text-sm">
                    <CheckCircle className="h-3 w-3 mr-2"/>{std}
                  </Badge>
                ))}
              </div>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center p-4">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3"/>
                  <h3 className="font-semibold">Policy Engine</h3>
                  <p className="text-sm text-slate-500 mt-1">Every action evaluated against policies</p>
                </div>
                <div className="text-center p-4">
                  <FileText className="h-8 w-8 text-purple-600 mx-auto mb-3"/>
                  <h3 className="font-semibold">Audit Logs</h3>
                  <p className="text-sm text-slate-500 mt-1">Immutable trails with trace IDs</p>
                </div>
                <div className="text-center p-4">
                  <Users className="h-8 w-8 text-green-600 mx-auto mb-3"/>
                  <h3 className="font-semibold">HITL Approval</h3>
                  <p className="text-sm text-slate-500 mt-1">Human-in-loop for high-risk actions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6 py-12">
          <Card className="card bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Join enterprises using AgentFlow OS for governed AI agent orchestration. 
                Start your free trial today.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => router.push('/login')} className="bg-white text-blue-600 hover:bg-blue-50 px-8 h-12 text-lg">
                  Create Free Account
                </Button>
                <Button variant="outline" onClick={() => router.push('/dashboard')} className="border-white text-white hover:bg-white/10 h-12 text-lg">
                  View Live Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="text-center text-slate-500 text-sm py-8 border-t">
          <p>Built for Enterprise AI Governance Hackathon 2026</p>
          <p className="mt-2">AgentFlow OS v1.0.0 • Governed AI at Enterprise Scale</p>
        </footer>
      </main>
    </div>
  )
}
