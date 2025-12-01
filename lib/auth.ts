import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const AUTH_COOKIE_NAME = 'auth_token'

function getSecretKey() {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function createAuthToken(): Promise<string> {
  const token = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecretKey())
  
  return token
}

export async function verifyAuthToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecretKey())
    return true
  } catch {
    return false
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(AUTH_COOKIE_NAME)?.value
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthCookie()
  if (!token) return false
  return verifyAuthToken(token)
}

export function validatePassword(password: string): boolean {
  const correctPassword = process.env.AUTH_PASSWORD?.trim()
  if (!correctPassword) throw new Error('AUTH_PASSWORD is not set')
  return password === correctPassword
}

