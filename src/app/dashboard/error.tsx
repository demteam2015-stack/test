'use client' // Error components must be Client Components
 
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-4">
      <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
      <h2 className="text-2xl font-headline font-bold mb-2">Что-то пошло не так!</h2>
      <p className="text-muted-foreground mb-6 max-w-md">Мы столкнулись с непредвиденной проблемой. Пожалуйста, попробуйте еще раз. Если проблема не исчезнет, обратитесь в службу поддержки.</p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Попробовать снова
      </Button>
    </div>
  )
}
