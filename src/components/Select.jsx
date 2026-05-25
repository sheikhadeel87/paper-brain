import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { inputCls } from '../lib/uiClasses.js'

function normalizeOptions(options) {
  return (Array.isArray(options) ? options : []).map((option) =>
    typeof option === 'string'
      ? { value: option, label: option }
      : {
          value: String(option?.value ?? ''),
          label: String(option?.label ?? option?.value ?? ''),
        },
  )
}

export function Select({
  value = '',
  options,
  onChange,
  disabled = false,
  placeholder = 'Select',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  ariaLabel,
}) {
  const id = useId()
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [menuRect, setMenuRect] = useState(null)
  const normalizedOptions = useMemo(() => normalizeOptions(options), [options])
  const selected = normalizedOptions.find((option) => option.value === String(value))

  useEffect(() => {
    if (!open) return undefined

    function updateRect() {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return
      const estimatedMenuHeight = Math.min(256, normalizedOptions.length * 40 + 8)
      const spaceBelow = window.innerHeight - rect.bottom - 8
      const shouldOpenUp = spaceBelow < estimatedMenuHeight && rect.top > spaceBelow
      const menuWidth = Math.max(rect.width, 144)
      const left = Math.min(rect.left, window.innerWidth - menuWidth - 8)
      setMenuRect({
        left: Math.max(8, left),
        top: shouldOpenUp
          ? Math.max(8, rect.top - estimatedMenuHeight - 6)
          : rect.bottom + 6,
        width: menuWidth,
        maxHeight: shouldOpenUp
          ? Math.max(120, rect.top - 14)
          : Math.max(120, window.innerHeight - rect.bottom - 14),
      })
    }

    function onPointerDown(event) {
      if (
        buttonRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return
      }
      setOpen(false)
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    updateRect()
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [normalizedOptions.length, open])

  function choose(nextValue) {
    if (typeof onChange === 'function') onChange(nextValue)
    setOpen(false)
    buttonRef.current?.focus()
  }

  const menu =
    open && menuRect
      ? createPortal(
          <div
            ref={menuRef}
            id={`${id}-menu`}
            className={`fixed z-[120] overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1 text-sm text-zinc-900 shadow-2xl ring-1 ring-zinc-950/5 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-white/10 ${menuClassName}`}
            style={{
              left: menuRect.left,
              top: menuRect.top,
              width: menuRect.width,
              maxHeight: menuRect.maxHeight,
            }}
            role="listbox"
          >
            {normalizedOptions.map((option) => {
              const active = option.value === String(value)
              return (
                <button
                  key={option.value}
                  type="button"
                  className={
                    active
                      ? 'flex w-full items-center gap-2 rounded-lg bg-violet-100 px-3 py-2 text-left font-semibold text-violet-900 dark:bg-violet-950/70 dark:text-violet-100'
                      : 'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                  }
                  onClick={() => choose(option.value)}
                  role="option"
                  aria-selected={active}
                >
                  <Check
                    className={`h-4 w-4 shrink-0 ${active ? 'opacity-100' : 'opacity-0'}`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 truncate">{option.label}</span>
                </button>
              )
            })}
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`${inputCls} flex w-full items-center justify-between gap-2 text-left ${buttonClassName || className}`}
        disabled={disabled}
        onClick={() => setOpen((next) => !next)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        aria-label={ariaLabel}
      >
        <span className={`min-w-0 truncate ${selected ? '' : 'text-zinc-500 dark:text-zinc-400'}`}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-500 transition dark:text-zinc-400 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {menu}
    </>
  )
}
