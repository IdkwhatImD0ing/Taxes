import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import OpenAI from 'openai'

const AUTH_COOKIE_NAME = 'auth_token'

async function verifyAuth(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (!token) return false
  
  try {
    const secret = process.env.AUTH_SECRET
    if (!secret) return false
    const secretKey = new TextEncoder().encode(secret)
    await jwtVerify(token, secretKey)
    return true
  } catch {
    return false
  }
}

// JSON Schema for structured output
const billSplitSchema = {
  type: 'json_schema' as const,
  name: 'bill_split',
  schema: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the person'
            },
            amount: {
              type: 'number',
              description: 'Total amount this person owes in dollars'
            }
          },
          required: ['name', 'amount'],
          additionalProperties: false
        },
        description: 'List of people and what they owe'
      },
      explanation: {
        type: 'string',
        description: 'A brief explanation of how the bill was split, including subtotals, tax, tip calculations, and any shared items'
      }
    },
    required: ['items', 'explanation'],
    additionalProperties: false
  },
  strict: true
}

export async function POST(request: NextRequest) {
  // Verify authentication
  if (!(await verifyAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
  }

  try {
    const { imageUrl, prompt } = await request.json()
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const openai = new OpenAI({ apiKey })

    // Use the Responses API with vision and structured outputs
    const response = await openai.responses.create({
      model: 'gpt-5.2',
      reasoning: { effort: 'medium' },
      input: [
        {
          role: 'system',
          content: `You are a helpful assistant that analyzes restaurant receipts and splits bills between people.
          
Given a receipt image and a description of who ordered what, calculate how much each person owes.
Include tax and tip proportionally split based on each person's subtotal.
Round amounts to 2 decimal places.
If items aren't clearly assigned to someone, split them evenly among all mentioned people.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_image',
              image_url: imageUrl
            },
            {
              type: 'input_text',
              text: prompt
            }
          ]
        }
      ],
      text: {
        format: billSplitSchema
      }
    })

    // Parse the structured output
    const outputText = response.output_text
    const result = JSON.parse(outputText)

    return NextResponse.json({ 
      success: true, 
      items: result.items,
      explanation: result.explanation
    })
  } catch (error) {
    console.error('OpenAI analysis error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ error: 'Failed to analyze receipt' }, { status: 500 })
  }
}

