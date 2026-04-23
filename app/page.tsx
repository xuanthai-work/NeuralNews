"use client";

import {
  Sidebar,
  Header,
  StatsGrid,
  CategoryFilter,
  NewsCard,
  BottomNav,
  Footer,
  LoadingState,
  ErrorState,
  EmptyState,
} from "./components";
import { useNews } from "./hooks/useNews";
import { useTheme } from "./context/ThemeContext";

export default function Home() {
  const {
    loading,
    error,
    data,
    searchTerm,
    selectedCategory,
    refreshing,
    refreshStatus,
    setSearchTerm,
    setSelectedCategory,
    handleRefresh,
    filteredStories,
  } = useNews();

  const { darkMode } = useTheme();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={handleRefresh} />;
  }

  const bgClass = darkMode ? "bg-zinc-950" : "bg-zinc-50";
  const textClass = darkMode ? "text-zinc-100" : "text-zinc-900";

  return (
    <div className={`min-h-screen ${bgClass} ${textClass}`}>
      <Sidebar />

      <main className="lg:ml-64 min-h-screen flex flex-col">
        <Header
          searchTerm={searchTerm}
          refreshing={refreshing}
          onSearchChange={setSearchTerm}
          onRefresh={handleRefresh}
        />

        <div className="p-4 md:p-6 max-w-[1200px] mx-auto w-full flex-1">
          <StatsGrid />

          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            dataGeneratedAt={data?.generated_at}
            refreshStatus={refreshStatus}
          />

          {filteredStories && filteredStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredStories.map((story) => (
                <NewsCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <EmptyState searchTerm={searchTerm} onClearSearch={() => setSearchTerm("")} />
          )}

          <div className="mt-8 flex justify-center">
            <button className={`${darkMode ? "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-600" : "bg-zinc-200 text-zinc-700 border-zinc-300 hover:border-zinc-400"} px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              Load More Signals
            </button>
          </div>
        </div>

        <Footer />
      </main>

      <BottomNav />
    </div>
  );
}
