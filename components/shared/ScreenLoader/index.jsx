import { Loader2 } from 'lucide-react'

const ScreenLoader = ({ className }) => {
  return (
    <div className={`absolute bottom-0 left-[230px] top-0 right-0 h-full bg-neutral-50/70 z-50 flex items-center justify-center ${className}`} >
      <Loader2 className='animate-spin text-blue-500' size={40} />
    </div>
  )
}

export default ScreenLoader