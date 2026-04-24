import { Ubuntu } from 'next/font/google'
import { cn } from '@/lib/utils'
const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

export default async function OurServices() {
  return (
    <div className="w-full">
      <main className="w-full max-w-[1440px] p-10 mx-auto min-h-[calc(100vh-0px)] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center mb-32 gap-4">
          <h1 className={cn("text-6xl font-bold text-center", ubuntu.className)}>Our Services</h1>
          <p className={cn("text-lg text-center", ubuntu.className)}>We offer a wide range of services to help you grow your business and reach your goals.</p>
        </div>
      </main>
    </div>
  );
}
