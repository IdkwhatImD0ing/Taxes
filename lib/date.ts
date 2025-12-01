// Format a date string (YYYY-MM-DD) to a readable format in PST
export function formatDatePST(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  // Parse the date string and create a date at noon to avoid timezone issues
  const date = new Date(dateString + 'T12:00:00')
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Los_Angeles',
  }
  
  return date.toLocaleDateString('en-US', options || defaultOptions)
}

export function formatDateShortPST(dateString: string): string {
  return formatDatePST(dateString, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Los_Angeles',
  })
}

// Get today's date in YYYY-MM-DD format in PST
export function getTodayPST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })
}

