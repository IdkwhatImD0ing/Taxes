import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { createServerSupabaseClient } from '@/lib/supabase'

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

// Generate signed upload URL
export async function POST(request: NextRequest) {
  // Verify authentication
  if (!(await verifyAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { filename, contentType } = await request.json()
    
    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    
    // Generate unique filename
    const fileExt = filename.split('.').pop()
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Create signed upload URL (valid for 60 seconds)
    const { data, error } = await supabase.storage
      .from('receipts')
      .createSignedUploadUrl(uniqueFilename)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get the public URL for after upload
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(uniqueFilename)

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: uniqueFilename,
      publicUrl,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
  }
}

