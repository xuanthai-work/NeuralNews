"use client";

import { useTheme } from "../context/ThemeContext";

export default function SettingsPage() {
  const { darkMode, toggleDarkMode, autoRefresh, toggleAutoRefresh } = useTheme();

  return (
    <div className={`min-h-screen ${darkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
      {/* Sidebar Navigation (Desktop) */}
      <aside className={`fixed left-0 top-0 h-screen w-64 border-r ${darkMode ? "border-zinc-800 bg-zinc-950" : "border-zinc-200 bg-zinc-50"} hidden lg:flex flex-col p-4 gap-2 z-50`}>
        <div className="mb-8 px-2 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div>
            <h1 className={`text-xl font-black tracking-tight ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}>NeuralNews</h1>
            <p className={`text-[10px] font-mono tracking-widest ${darkMode ? "text-zinc-500" : "text-zinc-600"}`}>V1.0.0</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <a className={`${darkMode ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50" : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"} flex items-center gap-3 px-3 py-2 rounded-md transition-all`} href="/">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span className="font-medium text-sm">Latest Feed</span>
          </a>
          <a className={`${darkMode ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50" : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"} flex items-center gap-3 px-3 py-2 rounded-md transition-all`} href="/benchmarks">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="font-medium text-sm">Benchmarks</span>
          </a>
          <a className={`${darkMode ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50" : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"} flex items-center gap-3 px-3 py-2 rounded-md transition-all`} href="#">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="font-medium text-sm">Model Hub</span>
          </a>
          <a className={`${darkMode ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50" : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"} flex items-center gap-3 px-3 py-2 rounded-md transition-all`} href="#">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="font-medium text-sm">Saved Items</span>
          </a>
        </nav>

        <div className={`border-t ${darkMode ? "border-zinc-800" : "border-zinc-200"} pt-4`}>
          <a className={`${darkMode ? "bg-zinc-900 text-zinc-100 border border-zinc-800 hover:bg-zinc-800" : "bg-zinc-200 text-zinc-900 border border-zinc-300 hover:bg-zinc-300"} rounded-md flex items-center gap-3 px-3 py-2 transition-all`} href="/settings">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium text-sm">Settings</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className={`sticky top-0 w-full z-50 backdrop-blur-md h-14 ${darkMode ? "bg-zinc-950/80 border-b border-zinc-800" : "bg-white/80 border-b border-zinc-200"}`}>
          <div className="flex justify-between items-center px-4 md:px-6 h-full max-w-[1440px] mx-auto">
            <div className="flex items-center gap-6">
              <span className="lg:hidden text-lg font-bold text-zinc-50 tracking-tighter">NeuralNews</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6 max-w-[800px] mx-auto w-full flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-50 mb-2">Settings</h1>
            <p className="text-zinc-400">Manage your preferences.</p>
          </div>

          {/* Preferences */}
          <section className={`${darkMode ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-zinc-200"} rounded-xl p-6 mb-6`}>
            <h2 className={`text-lg font-bold mb-4 ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-zinc-200" : "text-zinc-900"}`}>Dark Mode</p>
                  <p className={`text-xs ${darkMode ? "text-zinc-500" : "text-zinc-600"}`}>Use dark theme across the app</p>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`w-12 h-6 rounded-full transition-colors ${darkMode ? "bg-indigo-500" : "bg-zinc-700"}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${darkMode ? "translate-x-6 ml-0.5" : "translate-x-0.5"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-zinc-200" : "text-zinc-900"}`}>Auto Refresh</p>
                  <p className={`text-xs ${darkMode ? "text-zinc-500" : "text-zinc-600"}`}>Automatically refresh feed every 6 hours</p>
                </div>
                <button
                  onClick={toggleAutoRefresh}
                  className={`w-12 h-6 rounded-full transition-colors ${autoRefresh ? "bg-indigo-500" : "bg-zinc-700"}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${autoRefresh ? "translate-x-6 ml-0.5" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
          </section>

          {/* Data Sources Info */}
          <section className={`${darkMode ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-zinc-200"} rounded-xl p-6 mb-6`}>
            <h2 className={`text-lg font-bold mb-4 ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>Data Sources</h2>
            <div className="space-y-3">
              <div className={`flex items-center justify-between py-2 border-b ${darkMode ? "border-zinc-800" : "border-zinc-200"}`}>
                <div className="flex items-center gap-3">
                  <span className={darkMode ? "text-amber-400" : "text-amber-600"}>🏆</span>
                  <span className={`text-sm ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>Hugging Face Benchmarks</span>
                </div>
                <span className="text-xs text-emerald-400 font-medium">Active</span>
              </div>
              <div className={`flex items-center justify-between py-2 border-b ${darkMode ? "border-zinc-800" : "border-zinc-200"}`}>
                <div className="flex items-center gap-3">
                  <span className={darkMode ? "text-blue-400" : "text-blue-600"}>🧠</span>
                  <span className={`text-sm ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>AI Company Blogs</span>
                </div>
                <span className="text-xs text-emerald-400 font-medium">Active</span>
              </div>
              <div className={`flex items-center justify-between py-2 border-b ${darkMode ? "border-zinc-800" : "border-zinc-200"}`}>
                <div className="flex items-center gap-3">
                  <span className={darkMode ? "text-purple-400" : "text-purple-600"}>📰</span>
                  <span className={`text-sm ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>Tech News RSS</span>
                </div>
                <span className="text-xs text-emerald-400 font-medium">Active</span>
              </div>
              <div className={`flex items-center justify-between py-2 border-b ${darkMode ? "border-zinc-800" : "border-zinc-200"}`}>
                <div className="flex items-center gap-3">
                  <span className={darkMode ? "text-emerald-400" : "text-emerald-600"}>👥</span>
                  <span className={`text-sm ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>Community (HN, Reddit)</span>
                </div>
                <span className="text-xs text-emerald-400 font-medium">Active</span>
              </div>
            </div>
          </section>

          {/* Scraper Config Note */}
          <section className={`${darkMode ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-zinc-200"} rounded-xl p-6 mb-6`}>
            <h2 className={`text-lg font-bold mb-4 ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>Scraper Configuration</h2>
            <div className={`text-sm ${darkMode ? "text-zinc-400" : "text-zinc-600"} space-y-2`}>
              <p>AI scraping settings are configured via the <code className={`${darkMode ? "bg-zinc-950" : "bg-zinc-100"} px-2 py-1 rounded`}>.env</code> file:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><code className={darkMode ? "text-zinc-300" : "text-zinc-700"}>AZURE_OPENAI_ENDPOINT</code> - Your Azure OpenAI endpoint</li>
                <li><code className={darkMode ? "text-zinc-300" : "text-zinc-700"}>AZURE_OPENAI_API_KEY</code> - Your API key</li>
                <li><code className={darkMode ? "text-zinc-300" : "text-zinc-700"}>AZURE_OPENAI_DEPLOYMENT</code> - Model deployment name</li>
              </ul>
              <p className={`text-xs ${darkMode ? "text-zinc-500" : "text-zinc-600"} mt-4`}>Run <code className={`${darkMode ? "bg-zinc-950" : "bg-zinc-100"} px-2 py-1 rounded`}>python scraper.py</code> to fetch news articles.</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className={`border-t mt-auto ${darkMode ? "border-zinc-800" : "border-zinc-200"}`}>
          <div className={`max-w-7xl mx-auto px-4 py-6 text-center text-sm ${darkMode ? "text-zinc-500" : "text-zinc-600"}`}>
            <div className="mb-2">
              NeuralNews &middot; Settings
            </div>
            <div className="text-xs text-zinc-600">
              Manage your preferences
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
