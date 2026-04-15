const CARDS = [
  {
    title: 'Getting Started',
    body: 'Learn the fundamentals of Claude Code and how to integrate it into your workflow.',
    badge: 'Beginner',
    badgeColor: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  },
  {
    title: 'Advanced Prompting',
    body: 'Explore prompt engineering patterns that get the most out of Claude\'s reasoning capabilities.',
    badge: 'Intermediate',
    badgeColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  },
  {
    title: 'API Integration',
    body: 'Connect your applications to Claude using the Anthropic SDK with streaming and tool use.',
    badge: 'Advanced',
    badgeColor: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  },
]

const STATS = [
  { label: 'Modules completed', value: '0 / 3' },
  { label: 'Hours logged', value: '0h' },
  { label: 'Current streak', value: '0 days' },
]

export function MainContent() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      {/* Hero */}
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-3">
          Welcome to Claude Code 101
        </h1>
        <p className="text-lg text-gray-500 dark:text-slate-400 max-w-2xl">
          A hands-on guide to building with Claude. Use the toggle in the header to switch between
          light and dark mode — your preference is saved automatically.
        </p>
        <div className="mt-6 flex gap-3">
          <button type="button" className="px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-400 dark:hover:bg-indigo-500 text-white font-medium motion-safe:transition-colors motion-safe:duration-150">
            Start learning
          </button>
          <button type="button" className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium motion-safe:transition-colors motion-safe:duration-150">
            View docs
          </button>
        </div>
      </section>

      {/* Cards */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-5">
          Course modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-md dark:hover:shadow-slate-900/50 motion-safe:transition-shadow motion-safe:duration-200"
            >
              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-4 ${card.badgeColor}`}>
                {card.badge}
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">{card.title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{card.body}</p>
              <button type="button" className="mt-4 text-sm font-medium text-indigo-500 dark:text-indigo-400 hover:underline">
                Open module →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Stats row */}
      <section className="mt-12 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-5">Your progress</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-indigo-500 dark:text-indigo-400">{stat.value}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
