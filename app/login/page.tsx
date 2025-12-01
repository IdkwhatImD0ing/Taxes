'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Logging in...' : 'Enter'}
    </Button>
  )
}

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 via-amber-50 to-orange-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-800 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(249,115,22,0.08),transparent_50%)]" />
      
      <Card className="w-full max-w-sm relative z-10 border-stone-200/60 dark:border-stone-700/60 shadow-xl backdrop-blur-sm bg-white/80 dark:bg-stone-900/80">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-2">
            <span className="text-2xl">🧾</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-stone-800 to-stone-600 dark:from-stone-100 dark:to-stone-300 bg-clip-text text-transparent">
            Receipt Split
          </CardTitle>
          <CardDescription className="text-stone-500 dark:text-stone-400">
            Enter the password to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-stone-700 dark:text-stone-300">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoFocus
                className="border-stone-300 dark:border-stone-600 focus:border-amber-400 focus:ring-amber-400/20"
              />
            </div>
            
            {error && (
              <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-md">
                {error}
              </p>
            )}
            
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

