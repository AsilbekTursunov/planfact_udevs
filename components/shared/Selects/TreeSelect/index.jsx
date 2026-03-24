import { ChevronUp, Check, Search, X } from 'lucide-react'
import { useState, useMemo, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

const TreeNode = ({ node, level = 0, selectedValue, onSelect, multi }) => {
  const isSelected = multi ? selectedValue?.includes(node.value) : selectedValue === node.value;
  const isSelectable = node.isSelectable !== false;

  return (
    <div className='flex flex-col w-full'>
      <div
        className={cn(
          "w-full px-4 py-2 hover:bg-neutral-50 flex items-center justify-between text-xs transition-colors",
          isSelectable ? "cursor-pointer text-xs" : "cursor-default text-neutral-700",
          node.bold && "font-bold",
          isSelected && "bg-neutral-100/60"
        )}
        style={{ paddingLeft: `${16 + level * 16}px` }}
        onClick={(e) => {
          e.stopPropagation();
          if (isSelectable) onSelect(node);
        }}
      >
        <span>{node.label}</span>
        {isSelected && <Check size={16} className="text-primary" />}
      </div>

      {node.children && node.children.map(child => (
        <TreeNode
          key={child.value}
          node={child}
          level={level + 1}
          selectedValue={selectedValue}
          onSelect={onSelect}
          multi={multi}
        />
      ))}
    </div>
  )
}

const TreeSelect = ({
  data = [],
  value,
  onChange = () => { },
  placeholder = "Выберите",
  multi = false,
  className, dropdownClassName
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
    if (!value) return placeholder;
    if (multi && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      return `Выбрано: ${value.length}`;
    }

    // Find node label recursively for single selection
    const findLabel = (nodes) => {
      for (const node of nodes) {
        if (node.value === value) return node.label;
        if (node.children) {
          const found = findLabel(node.children);
          if (found) return found;
        }
      }
      return null;
    }
    return findLabel(data) || placeholder;
  }

  const isPlaceholder = getSelectedLabel() === placeholder;


  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const filterNodes = (nodes) => {
      return nodes.reduce((acc, node) => {
        const matchesSearch = node.label?.toLowerCase().includes(searchQuery.toLowerCase());
        const filteredChildren = node.children ? filterNodes(node.children) : [];

        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren });
        }
        return acc;
      }, []);
    }
    return filterNodes(data);
  }, [data, searchQuery])


  const handleSelect = (node) => {
    if (multi) {
      const currentValues = Array.isArray(value) ? value : [];

      const getSelectableValues = (n) => {
        let vals = [];
        if (n.isSelectable !== false) vals.push(n.value);
        if (n.children) {
          n.children.forEach(c => {
            vals = [...vals, ...getSelectableValues(c)];
          });
        }
        return vals;
      };

      const nodeValues = getSelectableValues(node);
      const allSelected = nodeValues.every(v => currentValues.includes(v));
      let newValue;

      if (allSelected) {
        newValue = currentValues.filter(v => !nodeValues.includes(v));
      } else {
        newValue = [...new Set([...currentValues, ...nodeValues])];
      }
      onChange(newValue);
    } else {
      onChange(node.value);
      setOpen(false);
    }
  }


  return (
    <div ref={containerRef} className='relative w-full'>
      <button
        ref={buttonRef}
        type="button"
        className={cn('flex items-center cursor-pointer bg-neutral-50 transition-all duration-200 justify-between w-full rounded-md border border-neutral-200 px-3 py-2.5 outline-none focus:border-primary/80', className)}
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
        {/* x button to delete selected */}
        {value?.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
            }}
            className="absolute right-8 top-1/2 cursor-pointer -translate-y-1/2 z-10"
          >
            <X size={16} className="text-neutral-400 hover:text-neutral-600" />
          </button>
        )}
        <span className={cn('text-gray-ucode-400 font-normal text-xs', (multi && value?.length > 0) || (!multi && value) && 'text-gray-ucode-800', isPlaceholder && 'text-gray-ucode-400')}>{getSelectedLabel()}</span>
        <ChevronUp size={16} className={cn('text-neutral-400 transition-transform duration-200', open ? 'rotate-0' : 'rotate-180')} />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className={cn(
          'absolute left-0 right-0 z-50 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-64 overflow-hidden flex flex-col', dropdownClassName,
          openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
        )}>
          {/* Search Input */}
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

          {/* Tree List */}
          <div className='overflow-y-auto flex-1 py-1 flex flex-col'>
            {filteredData.length === 0 ? (
              <div className='p-3 text-sm text-neutral-400 text-center'>Не найдено</div>
            ) : (
              filteredData.map(node => (
                <TreeNode
                  key={node.value}
                  node={node}
                  selectedValue={value}
                  onSelect={handleSelect}
                  multi={multi}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TreeSelect;


{/* <TreeSelect
  data={[
    { value: '1', label: 'Активы', bold: true, isSelectable: false, children: [
        { value: '2', label: 'Оборотные активы', bold: true, isSelectable: true },
        { value: '3', label: 'Запасы', isSelectable: true }
    ]}
  ]}
  multi={false}
  value={selectedValue}
  onChange={(val) => console.log('Selected:', val)}
/> */}
