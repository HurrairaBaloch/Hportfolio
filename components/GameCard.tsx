"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Gamepad2 } from "lucide-react";

interface Game {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  genre: string;
  dateAdded: string;
}

interface GameCardProps {
  game: Game;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}

export default function GameCard({ game, onDelete, showDelete }: GameCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="group relative rounded-2xl overflow-hidden bg-[#0f0f1a] border border-white/5 hover:border-purple-500/40 transition-all duration-500 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image / GIF */}
      <div className="relative w-full aspect-video overflow-hidden">
        {!imgError ? (
          <Image
            src={game.imageUrl}
            alt={game.title}
            fill
            className={`object-cover transition-transform duration-700 ${hovered ? "scale-110" : "scale-100"}`}
            onError={() => setImgError(true)}
            unoptimized // needed for GIFs
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1a1a2e]">
            <Gamepad2 className="w-12 h-12 text-purple-500/40" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-transparent to-transparent" />

        {/* Genre badge */}
        <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-600/80 text-white backdrop-blur-sm">
          {game.genre}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-white font-bold text-lg mb-1.5 group-hover:text-purple-400 transition-colors">
          {game.title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">
          {game.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">
            {new Date(game.dateAdded).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>

          <div className="flex items-center gap-2">
            {showDelete && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(game._id);
                }}
                className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
              >
                Delete
              </button>
            )}
            {game.link && (
              <a
                href={game.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20"
              >
                <ExternalLink className="w-3 h-3" />
                Visit
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Glow effect on hover */}
      <div
        className={`absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          boxShadow: "inset 0 0 30px rgba(139, 92, 246, 0.08)",
        }}
      />
    </div>
  );
}
