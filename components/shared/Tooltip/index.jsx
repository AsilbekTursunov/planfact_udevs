"use client"

import React from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

/**
 * CustomTooltip component for easy tooltip usage.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The element that triggers the tooltip.
 * @param {React.ReactNode} props.content - The content to be displayed inside the tooltip.
 * @param {string} [props.side='top'] - The side of the trigger where the tooltip should appear.
 * @param {number} [props.sideOffset=4] - The distance between the trigger and the tooltip.
 * @param {string} [props.className] - Additional class names for the tooltip content.
 */
const CustomTooltip = ({ 
  children, 
  content, 
  side = 'top', 
  sideOffset = 4, 
  className,
  ...props 
}) => {
  if (!content) return children

  return (
    <Tooltip {...props}>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent 
        side={side} 
        sideOffset={sideOffset} 
        className={className}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  )
}

export default CustomTooltip
