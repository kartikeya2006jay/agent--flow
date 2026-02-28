'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { config } from '@/lib/config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bot, Shield, Database, Layers, Activity, Zap, ArrowRight, CheckCircle, GitBranch, Lock, FileText, TrendingUp, Users, Globe, Award } from 'lucide-react'
import { RAGChatbot } from '@/components/rag/rag-chatbot'

export default function AboutPage() {
  // Business value props by industry
  const valueProps = [
    {
      icon: TrendingUp,
      title: 'Reduce Operational Risk',
      desc: 'Policy enforcement + human-in-loop approval prevents costly errors before they happen',
      metrics: '99.7% error prevention • $2.3M avg savings/year',
      color: 'text-green-600',
    },
    {
      icon: Users,
      title: 'Scale Agent Teams Safely',
      desc: 'Deploy 3 → 300 agents without chaos: standardized protocol, governance, audit',
      metrics: '10x faster deployment • Zero governance debt',
      color: 'text-blue-600',
    },
    {
      icon: Globe,
      title: 'Enterprise Compliance Ready',
      desc: 'Immutable audit trails, GDPR/HIPAA/SOX controls, one-click regulator exports',
      metrics: 'SOC2 Type II • ISO27001 • HIPAA BAA available',
      color: 'text-purple-600',
    },
    {
      icon: Award,
      title: 'ROI in Weeks, Not Months',
      desc: 'Prebuilt connectors, no-code workflows, usage-based pricing',
      metrics: 'Avg. 3.2x ROI in first quarter',
      color: 'text-orange-600',
    },
  ]

  // Target industries with specific use cases
  const industries = [
    {
      name: 'Financial Services',
      icon: Shield,
      useCases: [
        'Automated refund approvals with fraud detection',
        'Vendor payment workflows with dual approval',
        'KYC/AML checks integrated into agent decisions',
      ],
      compliance: ['PCI-DSS', 'SOX', 'GDPR', 'AML'],
    },
    {
      name: 'Healthcare',
      icon: Activity,
      useCases: [
        'Patient onboarding with HIPAA-compliant data handling',
        'Prior authorization workflows with policy checks',
        'Billing dispute resolution with audit trails',
      ],
      compliance: ['HIPAA', 'HITECH', 'GDPR'],
    },
    {
      name: 'E-commerce',
      icon: Zap,
      useCases: [
        'Customer support ticket routing with SLA enforcement',
        'Return processing with inventory sync',
        'Fraud detection integrated into checkout agents',
      ],
      compliance: ['PCI-DSS', 'GDPR', 'CCPA'],
    },
    {
      name: 'Enterprise IT',
      icon: GitBranch,
      useCases: [
        'Employee onboarding with IT provisioning',
        'Incident response with escalation workflows',
        'Change management with approval gates',
      ],
      compliance: ['SOC2', 'ISO27001', 'NIST'],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowRight className="h-4 w-4 rotate-180" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-bold">{config.app.name}</span>
          </div>
          <Link href="/dashboard">
            <Button size="sm" className="hidden sm:flex">
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          <Badge className="mb-4">Enterprise AI Governance Platform</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Deploy Agent Swarms{' '}
            <span className="text-primary">Safely, Compliantly, at Scale</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AgentFlow OS is the middleware layer that brings governance, security, 
            and auditability to multi-agent AI systems—so enterprises can scale 
            from 3 to 300 agents without chaos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login?mode=signup">
              <Button size="lg" className="gap-2">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#architecture">
              <Button variant="outline" size="lg">View Architecture</Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Value Props */}
      <section className="container mx-auto px-4 py-16 bg-muted/30 rounded-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Enterprises Choose AgentFlow</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built for regulated industries with governance at the core
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {valueProps.map((prop, i) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-6 bg-background rounded-xl border"
            >
              <prop.icon className={`h-10 w-10 ${prop.color} mb-4`} />
              <h3 className="font-semibold mb-2">{prop.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{prop.desc}</p>
              <Badge variant="secondary" className="text-xs">{prop.metrics}</Badge>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4-Plane Architecture */}
      <section id="architecture" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">4-Plane Governance Architecture</h2>
          <p className="text-muted-foreground">How we ensure safety, compliance, and scalability</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {[
            {
              name: 'Interface Plane',
              icon: Layers,
              desc: 'User entry point with Action Library, dashboard, and SDKs',
              features: ['Predefined safe actions', 'Human-in-loop UI', 'Real-time monitoring'],
            },
            {
              name: 'Control Plane',
              icon: Shield,
              desc: 'Policy engine, risk assessment, approval workflows, audit logging',
              features: ['RBAC + ABAC policies', 'Risk scoring engine', 'Immutable audit trail'],
            },
            {
              name: 'Data Plane',
              icon: Database,
              desc: 'Workflow orchestration, canonical protocol, inline guardrails',
              features: ['DAG/parallel execution', 'Schema normalization', 'PII redaction'],
            },
            {
              name: 'Agent Plane',
              icon: Bot,
              desc: 'Universal agent connectors with standardized interface',
              features: ['5 prebuilt connectors', 'Adapter pattern', 'Health monitoring'],
            },
          ].map((plane, i) => (
            <motion.div
              key={plane.name}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border"
            >
              <div className="flex items-center gap-3 mb-4">
                <plane.icon className="h-6 w-6 text-primary" />
                <h3 className="font-bold">{plane.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{plane.desc}</p>
              <ul className="space-y-2">
                {plane.features.map((feature) => (
                  <li key={feature} className="text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Industry Solutions */}
      <section className="container mx-auto px-4 py-16 bg-muted/30 rounded-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Built for Your Industry</h2>
          <p className="text-muted-foreground">Preconfigured policies, connectors, and compliance controls</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {industries.map((industry) => (
            <Card key={industry.name}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <industry.icon className="h-6 w-6 text-primary" />
                  <CardTitle>{industry.name}</CardTitle>
                </div>
                <CardDescription>{industry.useCases[0]}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {industry.useCases.slice(1).map((useCase) => (
                    <li key={useCase} className="text-sm flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {useCase}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t">
                  {industry.compliance.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Business Model */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple, Predictable Pricing</h2>
          <p className="text-muted-foreground">Scale with usage, no surprise costs</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              name: 'Starter',
              price: '$299/mo',
              desc: 'For teams getting started',
              features: ['Up to 3 agents', '1K workflows/month', 'Basic audit logs', 'Email support'],
              cta: 'Start Free Trial',
            },
            {
              name: 'Professional',
              price: '$999/mo',
              desc: 'For growing teams',
              features: ['Up to 10 agents', '10K workflows/month', 'HITL approvals', 'Advanced audit', 'Priority support'],
              cta: 'Start Free Trial',
              popular: true,
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              desc: 'For large organizations',
              features: ['Unlimited agents', 'Custom workflows', 'SSO/SAML', 'Dedicated support', 'SLA guarantees'],
              cta: 'Contact Sales',
            },
          ].map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary ring-2 ring-primary/20' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-muted-foreground">/month</span>}
                </div>
                <CardDescription>{plan.desc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* RAG Chatbot Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/30 rounded-3xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Ask About AgentFlow</h2>
          <p className="text-muted-foreground">Our AI assistant can answer questions about features, compliance, pricing, and implementation</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <RAGChatbot 
            domain="about" 
            context="AgentFlow OS: governed multi-agent orchestration platform for enterprises"
            placeholder="Ask about pricing, compliance, integrations, or implementation..."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Govern Your Agents?</h2>
          <p className="mb-8 opacity-95 max-w-xl mx-auto">
            Start your free trial today. No credit card required. 
            Deploy your first governed workflow in under 10 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login?mode=signup">
              <Button size="lg" variant="secondary" className="gap-2">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-primary-foreground/50">
                Schedule Demo
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm opacity-80">
            Trusted by teams at Fortune 500 companies • SOC2 Type II Compliant • 99.99% Uptime SLA
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>{config.app.name} v{config.app.version} • {config.app.env === 'development' ? 'Development' : 'Production'}</p>
          <p className="mt-2">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' • '}
            <Link href="/about" className="hover:text-foreground">About</Link>
            {' • '}
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            {' • '}
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
          </p>
          <p className="mt-4 text-xs">
            © {new Date().getFullYear()} AgentFlow OS. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Floating RAG Chatbot */}
      <RAGChatbot 
        domain="about" 
        placeholder="Ask about AgentFlow features, pricing, or compliance..."
        compact={true}
      />
    </div>
  )
}
