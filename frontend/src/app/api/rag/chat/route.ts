import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client (server-side only)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// RAG context retrieval mock (replace with real vector DB)
async function retrieveContext(query: string, domain?: string): Promise<string[]> {
  // Mock context based on domain - replace with Chroma/Pinecone in prod
  const contexts: Record<string, string[]> = {
    finance: [
      'Company policy: Refunds under $1000 auto-approved for verified customers',
      'Compliance: All financial transactions require audit trail with trace_id',
      'Risk threshold: Transactions >$5000 require dual approval',
    ],
    hr: [
      'Onboarding checklist: IT setup, benefits enrollment, manager intro',
      'Compliance: Employee data must be encrypted at rest (GDPR Article 32)',
      'Approval: Department head sign-off required for role changes',
    ],
    devops: [
      'Incident response: P1 tickets require page to on-call engineer',
      'Change management: All production deploys require PR + approval',
      'Security: Secrets must be stored in Vault, never in code',
    ],
    default: [
      'Policy: All agent actions require policy evaluation before execution',
      'Audit: Every workflow generates immutable log entry with trace_id',
      'Governance: High-risk actions trigger human-in-loop approval',
    ],
  }
  
  return contexts[domain || 'default'] || contexts.default
}

// System prompt for RAG-enhanced responses
function buildSystemPrompt(domain: string, context: string[]): string {
  return `You are an expert assistant for ${domain} workflows in AgentFlow OS, 
a governed multi-agent orchestration platform. 

Context from knowledge base:
${context.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Guidelines:
- Answer questions about agent workflows, governance, and compliance
- Reference specific policies when relevant
- If unsure, ask for clarification rather than guessing
- Keep responses concise and actionable
- Never expose internal system details or API keys

User is asking about: ${domain} workflows`
}

export async function POST(request: NextRequest) {
  try {
    const { message, domain = 'default', conversationHistory = [] } = await request.json()
    
    // Validate input
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }
    
    // Retrieve RAG context
    const context = await retrieveContext(message, domain)
    
    // Build messages for OpenAI
    const messages = [
      { role: 'system', content: buildSystemPrompt(domain, context) },
      ...conversationHistory.slice(-5), // Keep last 5 messages for context
      { role: 'user', content: message },
    ]
    
    // Mock mode for development (no API calls)
    if (process.env.MOCK_LLM === 'true') {
      await new Promise(resolve => setTimeout(resolve, 800)) // Simulate latency
      return NextResponse.json({
        reply: `[MOCK MODE] Based on ${domain} policies: ${context[0]}\n\nFor "${message}", I recommend: Execute the action through the governed workflow with policy check → risk assessment → approval (if needed) → execution → audit log.`,
        sources: context,
        model: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o-mini',
        mock: true,
      })
    }
    
    // Real OpenAI call (production)
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o-mini',
      messages: messages as any,
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2048'),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
    })
    
    return NextResponse.json({
      reply: completion.choices[0]?.message?.content || 'No response generated',
      sources: context,
      model: completion.model,
      usage: completion.usage,
      mock: false,
    })
    
  } catch (error: any) {
    console.error('RAG chat error:', error)
    
    // Fallback response for errors
    return NextResponse.json({
      reply: "I'm having trouble connecting to the knowledge base. Please try again or contact support.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      mock: true,
    }, { status: 500 })
  }
}
