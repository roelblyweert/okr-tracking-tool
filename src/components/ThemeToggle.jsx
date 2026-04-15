export function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'

  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="relative inline-flex items-center w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-800"
      style={{ backgroundColor: isDark ? '#818cf8' : '#d1d5db' }}
    >
      {/* sliding knob */}
      <span
        className={`
          absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow
          flex items-center justify-center text-sm
          transition-transform duration-300
          ${isDark ? 'translate-x-7' : 'translate-x-0'}
        `}
      >
        {isDark ? (
          // Moon icon
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#818cf8" className="w-3.5 h-3.5">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          // Sun icon
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#f59e0b" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        )}
      </span>
    </button>
  )
}
