import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client (server-side only - key never exposed to browser)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Enterprise knowledge base for RAG context
const KNOWLEDGE_BASE = {
  policies: [
    'Refunds under $1000 are auto-approved for verified customers',
    'Payments over $5000 require dual approval (finance + manager)',
    'Employee onboarding requires IT setup + benefits enrollment',
    'All actions generate immutable audit trails with trace_id',
    'High-risk actions (score >70) require executive approval',
  ],
  compliance: [
    'GDPR: All PII must be redacted before agent processing',
    'SOX: Financial transactions require audit trail retention (7 years)',
    'HIPAA: PHI must be encrypted at rest and in transit',
    'PCI-DSS: Payment data must be tokenized, never stored raw',
  ],
  workflows: [
    'Approve Refund: Support → Finance agents, auto-approve <$1000',
    'Onboard Employee: HR → IT/Ops agents, 2-3 business days',
    'Issue Payment: Finance agent only, dual approval >$5000',
    'Create Ticket: Support agent only, SLA based on priority',
  ]
}

// Build context-aware system prompt
function buildSystemPrompt(domain: string): string {
  return `You are an expert assistant for AgentFlow OS, a governed multi-agent orchestration platform for enterprises.

CONTEXT FROM KNOWLEDGE BASE:
${KNOWLEDGE_BASE.policies.map(p => `• ${p}`).join('\n')}
${KNOWLEDGE_BASE.compliance.map(c => `• ${c}`).join('\n')}
${KNOWLEDGE_BASE.workflows.map(w => `• ${w}`).join('\n')}

DOMAIN: ${domain}

GUIDELINES:
- Answer questions about agent workflows, governance, and compliance
- Reference specific policies when relevant
- Be concise and actionable (max 300 words)
- If unsure, ask for clarification rather than guessing
- Never expose internal system details or API keys
- Format responses with clear sections using **bold** for emphasis
- Include practical examples when helpful

USER IS ASKING ABOUT: ${domain} workflows`
}

export async function POST(request: NextRequest) {
  // keep domain in outer scope so the catch block can reference it
  let domain = 'default'

  try {
    const body = await request.json()
    const message = body.message
    domain = body.domain || domain
    const conversationHistory = body.conversationHistory || []
    
    // Validate input
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-api-key-here') {
      return NextResponse.json({
        reply: `⚠️ OpenAI API key not configured. Please add your API key to .env.local:\n\nOPENAI_API_KEY=sk-...\n\nFor now, here's a helpful response:\n\nI can help you with ${domain} workflows including policy questions, execution guidance, and compliance requirements. What would you like to know?`,
        sources: ['Configuration Required'],
        mock: true,
      })
    }
    
    // Build messages for OpenAI
    const messages = [
      { role: 'system', content: buildSystemPrompt(domain) },
      ...conversationHistory.slice(-5).map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ]
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: messages as any,
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
      temperature: 0.3,
    })
    
    return NextResponse.json({
      reply: completion.choices[0]?.message?.content || 'No response generated',
      sources: ['AgentFlow Knowledge Base', 'Policy Documentation', 'Compliance Guidelines'],
      model: completion.model,
      usage: completion.usage,
      mock: false,
    })
    
  } catch (error: any) {
    console.error('RAG chat error:', error)
    
    // Fallback response for errors
    return NextResponse.json({
      reply: `I'm having trouble connecting to the knowledge base right now. Here's what I can tell you about ${domain} workflows:\n\n• All actions require policy evaluation before execution\n• Risk assessment determines approval flow (auto/HITL/dual)\n• Every step is logged with immutable trace_id\n• Compliance tags are auto-applied (GDPR/SOX/HIPAA)\n\nPlease try again or contact support if the issue persists.`,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      sources: ['Fallback Response'],
      mock: true,
    }, { status: 500 })
  }
}
