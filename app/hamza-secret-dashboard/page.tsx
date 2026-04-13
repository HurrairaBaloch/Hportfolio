"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import AddGameModal from "@/components/AddGameModal";
import HamsterLoader from "@/components/HamsterLoader";

interface Game {
  _id: string;
  type: "game" | "asset" | "project";
  title: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  tags: string[];
  link: string;
  dateAdded: string;
}

function ItemCard({ game, deleting, onDelete, showVideo }: { game: Game; deleting: string | null; onDelete: (id: string) => void; showVideo?: boolean }) {
  return (
    <div className={`bg-[#1a191b] border border-white/5 rounded-lg overflow-hidden transition-opacity ${deleting === game._id ? "opacity-40 pointer-events-none" : ""}`}>
      <div className="relative aspect-video">
        <Image src={game.imageUrl} alt={game.title} fill unoptimized className="object-cover" />
        {showVideo && game.videoUrl && (
          <div className="absolute top-2 right-2 bg-[#00cffc]/20 border border-[#00cffc]/40 px-2 py-1 text-[9px] font-['Space_Grotesk'] font-bold text-[#00cffc] uppercase tracking-wider">
            Has Video
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-['Space_Grotesk'] font-bold text-white mb-1">{game.title}</h3>
        <p className="text-xs text-[#adaaab] line-clamp-2 mb-3">{game.description}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {game.tags?.map((t) => (
            <span key={t} className="text-[10px] font-['Space_Grotesk'] uppercase tracking-widest px-2 py-0.5 bg-[#a1ffc2]/8 border border-[#a1ffc2]/15 text-[#a1ffc2]/70">
              {t}
            </span>
          ))}
        </div>
        <button
          onClick={() => onDelete(game._id)}
          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          <Trash2 className="w-3 h-3" /> Delete
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/games");
      const data = await res.json();
      if (data.success) setGames(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGames(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/games/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) setGames((prev) => prev.filter((g) => g._id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const gameItems = games.filter(g => g.type === "game");
  const assetItems = games.filter(g => g.type === "asset");
  const projectItems = games.filter(g => g.type === "project");

  return (
    <main className="min-h-screen bg-[#0e0e0f] text-white font-['Manrope',sans-serif] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="text-[#a1ffc2] text-xs font-['Space_Grotesk'] uppercase tracking-[0.3em] mb-2">
              ● Dashboard
            </div>
            <h1 className="font-['Space_Grotesk'] text-3xl font-bold">Manage Projects</h1>
            <p className="text-[#adaaab] text-sm mt-1">{games.length} project{games.length !== 1 ? "s" : ""} in vault</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-white/15 text-white/85 font-['Space_Grotesk'] font-bold px-5 py-2.5 hover:border-[#a1ffc2]/60 hover:text-[#a1ffc2] transition-colors"
            >
              ← Home
            </Link>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-[#a1ffc2] text-[#00643a] font-['Space_Grotesk'] font-bold px-5 py-2.5 hover:bg-[#00fc9a] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Project
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Games", value: gameItems.length },
            { label: "Assets", value: assetItems.length },
            { label: "Projects", value: projectItems.length },
            { label: "Total", value: games.length },
          ].map((s) => (
            <div key={s.label} className="bg-[#1a191b] border border-white/5 p-4">
              <div className="font-['Space_Grotesk'] text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-[#adaaab] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Content by Type */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <HamsterLoader />
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-white/5">
            <p className="text-[#adaaab] mb-4">No items yet.</p>
            <button onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-[#a1ffc2] text-[#00643a] font-['Space_Grotesk'] font-bold px-5 py-2.5 hover:bg-[#00fc9a] transition-colors">
              <Plus className="w-4 h-4" /> Add First Item
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Games Section */}
            {gameItems.length > 0 && (
              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#a1ffc2] mb-4 uppercase tracking-wider">
                  🎮 Games ({gameItems.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gameItems.map((game) => (
                    <ItemCard key={game._id} game={game} deleting={deleting} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            )}

            {/* Assets Section */}
            {assetItems.length > 0 && (
              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#00cffc] mb-4 uppercase tracking-wider">
                  ✨ Assets ({assetItems.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assetItems.map((game) => (
                    <ItemCard key={game._id} game={game} deleting={deleting} onDelete={handleDelete} showVideo />
                  ))}
                </div>
              </div>
            )}

            {/* Projects Section */}
            {projectItems.length > 0 && (
              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-bold text-white mb-4 uppercase tracking-wider">
                  📦 Projects ({projectItems.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projectItems.map((game) => (
                    <ItemCard key={game._id} game={game} deleting={deleting} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <AddGameModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchGames(); }} />
      )}
    </main>
  );
}
