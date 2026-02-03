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

// JSON Schema for structured output with detailed breakdown per person
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
              description: 'Total amount this person owes in dollars (subtotal + tax_share + tip_share + fee_share)'
            },
            breakdown: {
              type: 'object',
              description: 'Detailed breakdown of how this person\'s total was calculated',
              properties: {
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      description: {
                        type: 'string',
                        description: 'Name/description of the item'
                      },
                      amount: {
                        type: 'number',
                        description: 'Price of the item in dollars'
                      }
                    },
                    required: ['description', 'amount'],
                    additionalProperties: false
                  },
                  description: 'Individual items this person ordered'
                },
                subtotal: {
                  type: 'number',
                  description: 'Sum of all individual items before tax and tip'
                },
                tax_share: {
                  type: 'number',
                  description: 'This person\'s proportional share of the tax'
                },
                tip_share: {
                  type: 'number',
                  description: 'This person\'s proportional share of the tip (0 if no tip)'
                },
                fee_share: {
                  type: 'number',
                  description: 'This person\'s proportional share of any service fees/surcharges (e.g., Economic Recovery Fee, Service Charge, Kitchen Appreciation). 0 if no fees.'
                },
                shared_items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      description: {
                        type: 'string',
                        description: 'Name/description of the shared item'
                      },
                      amount: {
                        type: 'number',
                        description: 'This person\'s share of the item cost'
                      },
                      split_with: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Names of other people this item was split with'
                      }
                    },
                    required: ['description', 'amount', 'split_with'],
                    additionalProperties: false
                  },
                  description: 'Items that were shared/split with others'
                }
              },
              required: ['items', 'subtotal', 'tax_share', 'tip_share', 'fee_share', 'shared_items'],
              additionalProperties: false
            }
          },
          required: ['name', 'amount', 'breakdown'],
          additionalProperties: false
        },
        description: 'List of people and what they owe with detailed breakdown'
      },
      explanation: {
        type: 'string',
        description: 'A brief overall summary of how the bill was split'
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
          content: `You are a receipt analysis assistant that calculates how much each person owes for their items.

# Task
Given a receipt image and a description of who ordered what items, calculate the total amount each person owes.

# Instructions
1. Identify all items on the receipt and their prices
2. Match each item to the person who ordered it based on the user's description
3. Calculate each person's subtotal (sum of their item prices)
4. Apply tax proportionally: (person's subtotal / receipt subtotal) × total tax
5. Apply fees proportionally: (person's subtotal / receipt subtotal) × total fees
6. Apply tip proportionally: (person's subtotal / receipt subtotal) × total tip
7. Final amount = person's subtotal + tax share + fee share + tip share

# Handling Service Fees and Surcharges
- Look for ANY fees or surcharges on the receipt (e.g., "Economic Recovery Fee", "Service Charge", "Kitchen Appreciation", "Living Wage Fee", percentage-based fees like "4.00%")
- These fees should be distributed proportionally among all people, just like tax
- Fee share = (person's subtotal / receipt subtotal) × total fees
- Include ALL fees found on the receipt - do not skip any

# Tip Detection (IMPORTANT)
- Check the receipt for any tip/gratuity line item
- ALSO check the user's prompt for tip mentions (e.g., "added 18% tip", "20% gratuity", "we tipped 15%")
- If the user specifies a tip percentage in their prompt, calculate: tip = percentage × receipt subtotal
- If tip is found on EITHER the receipt OR in the user's prompt, apply it proportionally to all people
- Only set tip_share to 0 if there is genuinely no tip mentioned anywhere

# Rules
- Only include people explicitly mentioned in the prompt
- Each person pays ONLY for items assigned to them
- Round all final amounts to 2 decimal places
- If an item can't be matched to anyone, note this in the explanation

# Item Categorization (IMPORTANT - NO DUPLICATES)
- The "items" array is ONLY for items this person ordered exclusively for themselves (not shared)
- The "shared_items" array is ONLY for items that were split with others
- If an item is shared/split, put it ONLY in shared_items, NOT in items
- Do NOT duplicate any item between the two arrays
- Each item should appear in exactly ONE array, never both
- Subtotal = sum of (items amounts) + sum of (shared_items amounts)

# CRITICAL: Complete Data for Every Person
- EVERY person must have a complete breakdown with: items, subtotal, tax_share, fee_share, tip_share, shared_items
- EVERY person's total amount MUST equal: subtotal + tax_share + fee_share + tip_share
- Do NOT omit any person's breakdown - all people must have the same complete data structure
- Double-check that each person's amount matches their breakdown sum before returning

# Output
For each person, provide their name and total amount owed. Include a clear explanation showing:
- Each person's items and subtotal
- Tax calculation breakdown
- Fee calculation breakdown (if applicable)
- Tip calculation breakdown (if applicable)
- Final totals`
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_image',
              image_url: imageUrl,
              detail: 'auto'
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

