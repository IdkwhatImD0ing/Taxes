// Client-side upload helper

export interface UploadResult {
  publicUrl: string
  path: string
}

export async function uploadImage(file: File): Promise<UploadResult> {
  // 1. Get signed upload URL from our API
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get upload URL')
  }

  const { signedUrl, token, path, publicUrl } = await response.json()

  // 2. Upload directly to Supabase Storage
  const uploadResponse = await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  })

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload file')
  }

  return { publicUrl, path }
}

