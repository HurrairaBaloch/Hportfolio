"use client";

import { Search, X } from "lucide-react";

const GENRES = ["All", "Action", "RPG", "FPS", "Strategy", "Adventure", "Sports", "Horror", "Indie", "Other"];

interface SearchFilterProps {
  search: string;
  onSearch: (val: string) => void;
  activeGenre: string;
  onGenre: (genre: string) => void;
}

export default function SearchFilter({ search, onSearch, activeGenre, onGenre }: SearchFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search games..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 transition-all"
        />
        {search && (
          <button
            onClick={() => onSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Genre filters */}
      <div className="flex flex-wrap gap-2">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => onGenre(genre)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 ${
              activeGenre === genre
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
}
