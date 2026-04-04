import { Loader2 } from 'lucide-react'

const ScreenLoader = ({ className, open }) => {
  return (
    <div style={{ zIndex: 10000 }} className={`fixed bottom-0 left-0 top-0 right-0 h-full bg-white/70 z-50 flex items-center justify-center `} >
      <Loader2 className='animate-spin text-blue-500' size={40} />
    </div>
  )
}

export default ScreenLoader