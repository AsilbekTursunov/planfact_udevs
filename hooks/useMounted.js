'use client'
import { useEffect, useState } from 'react'

export default function useMounted() {
	const [mounted, setMounted] = useState(false)
	useEffect(() => {
		let cancelled = false
		queueMicrotask(() => {
			if (!cancelled) setMounted(true)
		})
		return () => {
			cancelled = true
		}
	}, [])
	return mounted
}
