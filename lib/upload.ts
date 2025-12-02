// Client-side upload helper - uploads through our API proxy

export interface UploadResult {
  publicUrl: string
  path: string
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to upload')
  }

  return response.json()
}
