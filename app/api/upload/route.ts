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

// Handle file upload directly through API route
export async function POST(request: NextRequest) {
  // Verify authentication
  if (!(await verifyAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload directly from server
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(uniqueFilename, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(uniqueFilename)

    return NextResponse.json({ publicUrl, path: uniqueFilename })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}