import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { documentText, domain = 'enterprise' } = await request.json()
    
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-api-key-here') {
      // Fallback: Return mock policies
      return NextResponse.json({
        policies: [
          { id: 'policy_1', title: 'Refund Approval Policy', rule: 'Refunds under $1000 are auto-approved for verified customers', risk_level: 'low', compliance: ['PCI-DSS', 'GDPR'] },
          { id: 'policy_2', title: 'Payment Authorization', rule: 'Payments over $5000 require dual approval (finance + manager)', risk_level: 'high', compliance: ['SOX', 'AML'] },
          { id: 'policy_3', title: 'Employee Onboarding', rule: 'All new hires require IT setup + benefits enrollment within 3 business days', risk_level: 'medium', compliance: ['HIPAA', 'SOC2'] },
        ],
        mock: true,
        message: 'OpenAI API key not configured. Showing demo policies.'
      })
    }
    
    // Call OpenAI to extract policies from document
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a policy extraction expert. Analyze the provided document text and extract governance policies for an AI agent orchestration platform.

For each policy, extract:
1. Title (short, descriptive name)
2. Rule (clear, actionable statement)
3. Risk Level (low, medium, high, critical)
4. Compliance Tags (GDPR, SOX, HIPAA, PCI-DSS, etc.)

Return ONLY valid JSON in this format:
{
  "policies": [
    {
      "title": "Policy Title",
      "rule": "Clear rule statement",
      "risk_level": "low|medium|high|critical",
      "compliance": ["TAG1", "TAG2"]
    }
  ]
}`
        },
        {
          role: 'user',
          content: `Extract policies from this document:\n\n${documentText}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })
    
    const responseText = completion.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(responseText)
    
    // Add IDs to policies
    const policies = (parsed.policies || []).map((p: any, i: number) => ({
      ...p,
      id: `policy_${Date.now()}_${i}`,
    }))
    
    return NextResponse.json({
      policies,
      mock: false,
      message: `Successfully extracted ${policies.length} policies from document`
    })
    
  } catch (error: any) {
    console.error('Policy extraction error:', error)
    
    // Fallback to demo policies
    return NextResponse.json({
      policies: [
        { id: `policy_${Date.now()}_1`, title: 'Refund Approval Policy', rule: 'Refunds under $1000 are auto-approved for verified customers', risk_level: 'low', compliance: ['PCI-DSS', 'GDPR'] },
        { id: `policy_${Date.now()}_2`, title: 'Payment Authorization', rule: 'Payments over $5000 require dual approval (finance + manager)', risk_level: 'high', compliance: ['SOX', 'AML'] },
        { id: `policy_${Date.now()}_3`, title: 'Employee Onboarding', rule: 'All new hires require IT setup + benefits enrollment within 3 business days', risk_level: 'medium', compliance: ['HIPAA', 'SOC2'] },
      ],
      mock: true,
      message: 'Using demo policies (extraction failed)'
    }, { status: 500 })
  }
}
