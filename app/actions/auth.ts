'use server'

import { redirect } from 'next/navigation'
import { 
  validatePassword, 
  createAuthToken, 
  setAuthCookie, 
  clearAuthCookie 
} from '@/lib/auth'

export async function login(formData: FormData) {
  const password = (formData.get('password') as string)?.trim()
  
  if (!password) {
    return { error: 'Password is required' }
  }

  if (!validatePassword(password)) {
    return { error: 'Invalid password' }
  }

  const token = await createAuthToken()
  await setAuthCookie(token)
  
  redirect('/')
}

export async function logout() {
  await clearAuthCookie()
  redirect('/login')
}

