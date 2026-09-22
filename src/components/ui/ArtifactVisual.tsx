import React from 'react';
import type { CollectibleItem } from '../../types';
import { getRarityStyle } from '../../utils/rarity';

interface ArtifactVisualProps {
  item: CollectibleItem;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
  className?: string;
}

export const ArtifactVisual: React.FC<ArtifactVisualProps> = ({
  item,
  size = 'md',
  showGlow = true,
  className = '',
}) => {
  const rarity = getRarityStyle(item.rarity);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48',
  };

  const getSvg = () => {
    const primary = rarity.color;

    switch (item.iconType?.toLowerCase()) {
      case 'crown':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
            <defs>
              <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="50%" stopColor={primary} />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
            {/* Crown Base */}
            <path d="M15,75 L85,75 L80,82 L20,82 Z" fill="#1e1b4b" stroke={primary} strokeWidth="2" />
            {/* Crown Peaks */}
            <path
              d="M15,75 L15,40 L35,58 L50,22 L65,58 L85,40 L85,75 Z"
              fill={`url(#grad-${item.id})`}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            {/* Jewels */}
            <circle cx="50" cy="22" r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
            <circle cx="15" cy="40" r="3.5" fill="#ec4899" stroke="#ffffff" strokeWidth="1" />
            <circle cx="85" cy="40" r="3.5" fill="#ec4899" stroke="#ffffff" strokeWidth="1" />
            <polygon points="50,48 56,58 50,68 44,58" fill="#ffffff" opacity="0.9" />
          </svg>
        );

      case 'crystal':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
            <defs>
              <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="50%" stopColor={primary} />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            {/* Main Crystal Prism */}
            <polygon points="50,10 80,42 70,88 30,88 20,42" fill={`url(#grad-${item.id})`} stroke={primary} strokeWidth="2" />
            {/* Inner Facets */}
            <polygon points="50,10 50,88 30,88 20,42" fill="#ffffff" opacity="0.15" />
            <line x1="50" y1="10" x2="50" y2="88" stroke="#ffffff" strokeWidth="1.5" opacity="0.7" />
            <line x1="20" y1="42" x2="50" y2="52" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
            <line x1="80" y1="42" x2="50" y2="52" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
            {/* Core Sparkle */}
            <circle cx="50" cy="50" r="6" fill="#ffffff" filter="blur(1px)" />
          </svg>
        );

      case 'dragon':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
            <defs>
              <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="50%" stopColor={primary} />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            {/* Dragon Crest / Silhouette */}
            <path
              d="M30 80 Q25 45 45 30 Q40 18 55 12 Q52 24 65 26 Q78 28 85 45 Q70 50 68 62 Q75 70 82 72 Q65 85 45 82 Z"
              fill={`url(#grad-${item.id})`}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            {/* Horns & Eye */}
            <polygon points="45,30 35,15 48,22" fill="#ffffff" />
            <polygon points="55,26 60,8 65,22" fill="#ffffff" />
            <circle cx="60" cy="38" r="3.5" fill="#fef08a" stroke="#000" strokeWidth="1" />
            {/* Cyber Circuit Lines on Crest */}
            <path d="M45 50 L58 55 L52 70" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 2" />
          </svg>
        );

      case 'dice':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
            <defs>
              <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="60%" stopColor={primary} />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>
            {/* Isometric 3D Cube */}
            {/* Top face */}
            <polygon points="50,15 82,32 50,48 18,32" fill={`url(#grad-${item.id})`} stroke="#ffffff" strokeWidth="1.5" />
            {/* Left face */}
            <polygon points="18,32 50,48 50,85 18,68" fill="#78350f" stroke="#ffffff" strokeWidth="1.5" />
            {/* Right face */}
            <polygon points="50,48 82,32 82,68 50,85" fill="#92400e" stroke="#ffffff" strokeWidth="1.5" />
            {/* Pips */}
            <circle cx="50" cy="32" r="3" fill="#ffffff" />
            <circle cx="34" cy="25" r="2.5" fill="#ffffff" />
            <circle cx="66" cy="39" r="2.5" fill="#ffffff" />
            <circle cx="34" cy="56" r="3" fill="#fef08a" />
            <circle cx="34" cy="72" r="3" fill="#fef08a" />
            <circle cx="66" cy="56" r="3" fill="#fef08a" />
            <circle cx="66" cy="72" r="3" fill="#fef08a" />
          </svg>
        );

      case 'orb':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
            <defs>
              <radialGradient id={`grad-${item.id}`} cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor={primary} />
                <stop offset="70%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#05070d" />
              </radialGradient>
            </defs>
            {/* Outer Orbit Rings */}
            <ellipse cx="50" cy="50" rx="42" ry="16" stroke={primary} strokeWidth="1.5" strokeDasharray="6 3" transform="rotate(-25 50 50)" opacity="0.8" />
            {/* Glowing Orb Sphere */}
            <circle cx="50" cy="50" r="30" fill={`url(#grad-${item.id})`} stroke={primary} strokeWidth="2" />
            {/* Core Stars */}
            <circle cx="45" cy="45" r="2" fill="#ffffff" />
            <circle cx="55" cy="52" r="1.5" fill="#ffffff" />
            <circle cx="40" cy="55" r="1.5" fill="#ffffff" />
          </svg>
        );

      case 'cube':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
            <defs>
              <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor={primary} />
              </linearGradient>
            </defs>
            <polygon points="50,18 80,34 50,50 20,34" fill={`url(#grad-${item.id})`} stroke="#ffffff" strokeWidth="1.5" />
            <polygon points="20,34 50,50 50,82 20,66" fill="#1e1b4b" stroke={primary} strokeWidth="1.5" />
            <polygon points="50,50 80,34 80,66 50,82" fill="#311042" stroke={primary} strokeWidth="1.5" />
            <text x="44" y="68" fill="#ffffff" fontSize="20" fontWeight="bold" fontFamily="monospace">?</text>
          </svg>
        );

      case 'chest':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
            <defs>
              <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor={primary} />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            {/* Chest base */}
            <rect x="20" y="45" width="60" height="38" rx="6" fill={`url(#grad-${item.id})`} stroke={primary} strokeWidth="2" />
            {/* Chest lid */}
            <path d="M18,45 Q50,22 82,45 Z" fill="#1e293b" stroke={primary} strokeWidth="2" />
            {/* Lock with Glow */}
            <circle cx="50" cy="54" r="5" fill="#facc15" stroke="#ffffff" strokeWidth="1.5" />
            <rect x="47" y="54" width="6" height="8" rx="2" fill="#facc15" />
            {/* Cyber band */}
            <line x1="20" y1="62" x2="80" y2="62" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.8" />
          </svg>
        );

      case 'coin':
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
            <defs>
              <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor={primary} />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="36" fill={`url(#grad-${item.id})`} stroke="#ffffff" strokeWidth="2" />
            <circle cx="50" cy="50" r="30" stroke="#78350f" strokeWidth="2" strokeDasharray="4 3" fill="none" />
            <polygon points="50,28 55,42 70,42 58,52 62,68 50,58 38,68 42,52 30,42 45,42" fill="#ffffff" />
          </svg>
        );
    }
  };

  return (
    <div className={`relative flex items-center justify-center transition-transform duration-300 ${sizeClasses[size]} ${className}`}>
      {showGlow && (
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-35 pointer-events-none"
          style={{ background: rarity.color }}
        />
      )}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {getSvg()}
      </div>
    </div>
  );
};
