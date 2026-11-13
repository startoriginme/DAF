import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Check, Box } from 'lucide-react';
import { SKINS } from '../lib/constants';
import { Skin } from '../types/game';
import { SkinRenderer } from './SkinRenderer';
import { sound } from '../lib/audio';

interface SkinsModalProps {
  activeSkinId: string;
  unlockedSkinIds: string[];
  sugarCubes: number;
  onSelectSkin: (skinId: string) => void;
  onUnlockSkin: (skinId: string, cost: number) => void;
  onClose: () => void;
}

type RarityFilter = 'All' | 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Owned';

export const SkinsModal: React.FC<SkinsModalProps> = ({
  activeSkinId,
  unlockedSkinIds,
  sugarCubes,
  onSelectSkin,
  onUnlockSkin,
  onClose,
}) => {
  const [selectedPreview, setSelectedPreview] = useState<Skin>(
    SKINS.find((s) => s.id === activeSkinId) || SKINS[0]
  );
  const [filter, setFilter] = useState<RarityFilter>('All');

  // Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        sound.playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isUnlockedSkin = (skinId: string) =>
    unlockedSkinIds.includes(skinId) || skinId === 'amber';

  const filteredSkins = useMemo(() => {
    return SKINS.filter((skin) => {
      if (filter === 'All') return true;
      if (filter === 'Owned') return isUnlockedSkin(skin.id);
      return skin.rarity === filter;
    });
  }, [filter, unlockedSkinIds]);

  const getRarityBadgeColor = (rarity?: string) => {
    switch (rarity) {
      case 'Mythic':
        return 'text-rose-400 bg-rose-950/60 border-rose-700/70';
      case 'Legendary':
        return 'text-amber-400 bg-amber-950/60 border-amber-700/70';
      case 'Epic':
        return 'text-purple-400 bg-purple-950/60 border-purple-700/70';
      case 'Rare':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-700/70';
      default:
        return 'text-blue-400 bg-blue-950/60 border-blue-700/70';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-4xl bg-neutral-900 border border-blue-900/60 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Glow ambient background */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-500"
          style={{ background: selectedPreview.color }}
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-2xl border transition-all"
              style={{
                borderColor: `${selectedPreview.color}60`,
                background: `${selectedPreview.color}18`,
              }}
            >
              <Sparkles className="w-6 h-6" style={{ color: selectedPreview.color }} />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold font-['Caveat'] tracking-wide text-neutral-100 lowercase">
                skins
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-white font-['Patrick_Hand'] text-sm">
              <Box className="w-3.5 h-3.5 text-white" />
              <span>{sugarCubes} sugar</span>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto border-b border-neutral-800/60 no-scrollbar">
          {(['all', 'owned', 'common', 'rare', 'epic', 'legendary', 'mythic'] as const).map((r) => {
            const isSelected = filter.toLowerCase() === r;
            return (
              <button
                key={r}
                onClick={() => {
                  sound.playClick();
                  setFilter(
                    r === 'all'
                      ? 'All'
                      : r === 'owned'
                      ? 'Owned'
                      : ((r.charAt(0).toUpperCase() + r.slice(1)) as RarityFilter)
                  );
                }}
                className={`px-3 py-1 rounded-[220px_15px_200px_18px/15px_220px_18px_200px] font-['Patrick_Hand'] text-base lowercase whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-neutral-200 text-neutral-950 font-bold border border-white'
                    : 'bg-neutral-900/60 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                <span>{r}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Roster of Skins */}
        <div className="my-4 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 flex-1 min-h-0 content-start max-h-[62vh]">
          <AnimatePresence>
            {filteredSkins.map((skin) => {
              const unlocked = isUnlockedSkin(skin.id);
              const isActive = activeSkinId === skin.id;
              const isSelected = selectedPreview.id === skin.id;

              return (
                <motion.div
                  key={skin.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onMouseEnter={() => setSelectedPreview(skin)}
                  onClick={() => {
                    setSelectedPreview(skin);
                    if (unlocked) {
                      sound.playClick();
                      onSelectSkin(skin.id);
                    } else if (sugarCubes >= skin.cost) {
                      sound.playSugarCollect();
                      onUnlockSkin(skin.id, skin.cost);
                    } else {
                      sound.playHitSound();
                    }
                  }}
                  className={`group relative flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected || isActive
                      ? 'bg-neutral-800/90 shadow-lg'
                      : 'bg-neutral-900/60 hover:bg-neutral-800/50'
                  }`}
                  style={{
                    borderColor: isActive
                      ? skin.color
                      : isSelected
                      ? `${skin.color}80`
                      : 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <SkinRenderer skinId={skin.id} size={42} animated />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-['Patrick_Hand'] text-base tracking-wide text-white truncate lowercase">
                          {skin.name.toLowerCase()}
                        </span>
                        {skin.rarity && (
                          <span
                            className={`text-[10px] font-['Patrick_Hand'] lowercase px-1.5 py-0.2 rounded-md border ${getRarityBadgeColor(
                              skin.rarity
                            )}`}
                          >
                            {skin.rarity.toLowerCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {isActive ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-['Patrick_Hand'] bg-emerald-950/60 text-emerald-400 border border-emerald-800 lowercase">
                        <Check className="w-3 h-3" />
                        equipped
                      </span>
                    ) : unlocked ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-['Patrick_Hand'] bg-neutral-800 text-neutral-400 lowercase">
                        owned
                      </span>
                    ) : (
                      <span
                        className={`flex items-center gap-1 text-xs font-['Patrick_Hand'] px-2 py-0.5 rounded-lg border lowercase ${
                          sugarCubes >= skin.cost
                            ? 'text-white bg-neutral-700/80 border-neutral-500'
                            : 'text-neutral-400 bg-neutral-800 border-neutral-700'
                        }`}
                      >
                        <Box className="w-3 h-3 text-white" />
                        <span>{skin.cost}</span>
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
