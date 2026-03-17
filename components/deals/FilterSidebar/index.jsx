import { ArrowLeftToLine } from "lucide-react"
import { useState } from "react"
import { cn } from "@/app/lib/utils"
import GroupSelect from "../../shared/Selects/GroupSelect"

const FilterSidebar = () => {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <div className={cn("bg-neutral-100  transition-all duration-300 min-h-dvh", isOpen ? "w-64 p-3" : "w-8 p-1 pt-3")}>
      <div className="flex items-center justify-between">
        <h2 className={cn("text-lg font-semibold", isOpen ? "" : "hidden")}>Фильтр</h2>
        <button onClick={() => setIsOpen(!isOpen)} className={cn("text-neutral-600 cursor-pointer hover:text-neutral-900", isOpen ? "" : "transform rotate-180 transition-all duration-300")}>
          <ArrowLeftToLine size={20} className="text-primary" />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <GroupSelect />
      </div>
    </div>
  )
}

export default FilterSidebar