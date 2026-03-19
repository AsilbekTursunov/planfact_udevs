import { ChevronUp, Check, Search } from 'lucide-react'
import { useState, useMemo, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

const MultiSelect = ({
  data = [],
  value = [], // Array of values
  onChange = () => { },
  placeholder = "Выберите",
  withSearch = true,
  className,
  dropdownClassName
}) => {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [openUpwards, setOpenUpwards] = useState(false)
  const buttonRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const getSelectedLabel = () => {
    if (!value || value.length === 0) return placeholder;
    const selectedItems = data.filter(item => value.includes(item.value));
    if (selectedItems.length === 1) return selectedItems[0].label;
    if (selectedItems.length > 1) return `Выбрано: ${selectedItems.length}`;
    return placeholder;
  }

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter(item =>
      item.label?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const handleSelect = (val) => {
    const newValue = value.includes(val)
      ? value.filter(v => v !== val)
      : [...value, val];
    onChange(newValue);
  };

  return (
    <div ref={containerRef} className='relative w-full'>
      <button
        ref={buttonRef}
        type="button"
        className={cn(
          'flex items-center cursor-pointer bg-neutral-50 transition-all duration-200 justify-between w-full rounded-md border border-neutral-200 px-3 py-2 outline-none focus:border-primary/80',
          className
        )}
        onClick={() => {
          if (!open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - rect.bottom
            const spaceAbove = rect.top
            setOpenUpwards(spaceBelow < 256 && spaceAbove > spaceBelow)
          }
          setOpen(!open)
        }}
      >
        <span className='text-neutral-600 font-normal text-xs'>{getSelectedLabel()}</span>
        <ChevronUp size={16} className={cn('text-neutral-400 transition-transform duration-200', open ? 'rotate-0' : 'rotate-180')} />
      </button>

      {open && (
        <div className={cn(
          'absolute left-0 right-0 z-50 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-64 overflow-hidden flex flex-col', dropdownClassName,
          openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
        )}>
          {withSearch && (
            <div className='p-2 border-b border-gray-100 flex items-center gap-2 relative'>
              <Search size={16} className='absolute left-4 text-neutral-400' />
              <input
                type='text'
                className='w-full h-9 border border-primary/40 rounded-md pl-8 pr-2 py-1.5 text-sm outline-none placeholder:text-neutral-400'
                placeholder='Поиск по списку'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          <div className='overflow-y-auto flex-1 py-1 flex flex-col'>
            {filteredData.length === 0 ? (
              <div className='p-3 text-sm text-neutral-400 text-center'>Не найдено</div>
            ) : (
              filteredData.map(node => {
                const isSelected = value.includes(node.value);

                return (
                  <div
                    key={node.value}
                    className={cn(
                      "w-full px-4 py-2 hover:bg-neutral-50 flex items-center justify-between text-xs transition-colors cursor-pointer",
                      isSelected && "bg-neutral-100/60"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(node.value);
                    }}
                  >
                    <span>{node.label}</span>
                    {isSelected && <Check size={16} className={cn('text-primary transition-transform duration-200')} />}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MultiSelect;