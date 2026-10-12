import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, MessageCircle, Info, Upload, Check, RotateCcw } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { TEAM_MEMBERS, TRANSLATIONS } from '../data/content';

interface TeamSectionProps {
  currentLang: SupportedLanguage;
  isAdmin?: boolean;
}

export const TeamSection: React.FC<TeamSectionProps> = ({ currentLang, isAdmin = false }) => {
  const t = TRANSLATIONS[currentLang];
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Load any previously uploaded photos from localStorage
  useEffect(() => {
    try {
      const stored: Record<string, string> = {};
      TEAM_MEMBERS.forEach((m) => {
        const saved = localStorage.getItem(`team_photo_${m.id}`);
        if (saved) {
          stored[m.id] = saved;
        }
      });
      setCustomPhotos(stored);
    } catch {
      // Ignore localStorage availability issues
    }
  }, []);

  const handleFileUpload = (memberId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCustomPhotos((prev) => ({ ...prev, [memberId]: result }));
          try {
            localStorage.setItem(`team_photo_${memberId}`, result);
          } catch {
            // storage quota fallback
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetPhoto = (memberId: string) => {
    try {
      localStorage.removeItem(`team_photo_${memberId}`);
    } catch {
      // ignore
    }
    setCustomPhotos((prev) => {
      const next = { ...prev };
      delete next[memberId];
      return next;
    });
  };

  return (
    <section id="team" className="py-24 bg-[#FCFAF6] border-b border-[#E7DED4]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#B45F42]">
            <span className="w-6 h-[1.5px] bg-[#B45F42]" />
            <span>{t.teamHeading.kicker}</span>
          </div>

          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#10263D] leading-tight text-balance">
            {t.teamHeading.title}
          </h2>

          <p className="text-base sm:text-lg text-[#536176] leading-relaxed">
            {t.teamHeading.subtitle}
          </p>

          {/* Deontological note */}
          <div className="flex items-start gap-2.5 p-3.5 bg-white border border-[#E7DED4] rounded-lg text-xs text-[#536176]">
            <Info className="w-4 h-4 text-[#B45F42] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t.teamHeading.disclaimer}
            </p>
          </div>
        </div>

        {/* 5 Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TEAM_MEMBERS.map((member) => {
            // Priority:
            // 1. Photo uploaded via Admin session (localStorage)
            // 2. Direct static photo file in public/team/ (samad.jpg, annalisa.jpg, etc.)
            // 3. Fallback bundled photo
            const defaultPublicPath = `/team/${
              member.id === 'samad-chaudhry'
                ? 'samad.jpg'
                : member.id === 'annalisa-rottola'
                ? 'annalisa.jpg'
                : member.id === 'giovanni-rossetti'
                ? 'giovanni.jpg'
                : member.id === 'elisa-bova'
                ? 'elisa.jpg'
                : 'ahlam.jpg'
            }`;

            const currentPhoto = customPhotos[member.id] || member.image;
            const hasCustomPhoto = !!customPhotos[member.id];

            return (
              <div
                key={member.id}
                className={`group flex flex-col justify-between rounded-xl bg-white border border-[#E7DED4] shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden ${
                  member.isLegalCounsel ? 'ring-1 ring-[#B45F42]/30' : ''
                }`}
              >
                <div>
                  {/* Clean, Pristine Team Portrait Frame */}
                  <div className="relative aspect-[4/5] bg-[#10263D] overflow-hidden">
                    <img
                      src={currentPhoto}
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback = member.fallbackImage || member.image;
                        if (fallback && !target.src.endsWith(fallback)) {
                          target.src = fallback;
                        }
                      }}
                      alt={`Foto ufficiale di ${member.name}`}
                      className="w-full h-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />

                    {/* Subtle experience badge on top-right */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="text-[11px] font-semibold text-white bg-[#10263D]/85 backdrop-blur-md px-2.5 py-1 rounded-xs border border-white/20 shadow-sm">
                        {member.experienceLabel}
                      </span>
                    </div>

                    {/* ADMIN-ONLY CONTROLS: Completely invisible and hidden for all normal visitors */}
                    {isAdmin && (
                      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-black/75 backdrop-blur-md p-1.5 rounded border border-white/20">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={(el) => {
                            fileInputRefs.current[member.id] = el;
                          }}
                          onChange={(e) => handleFileUpload(member.id, e)}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[member.id]?.click()}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-white bg-[#B45F42] hover:bg-[#9a4f35] rounded-xs transition-colors"
                          title="Modifica foto (Solo amministratore)"
                        >
                          <Upload className="w-3 h-3" />
                          <span>{hasCustomPhoto ? 'Aggiorna' : 'Carica'}</span>
                          {hasCustomPhoto && <Check className="w-2.5 h-2.5 text-white" />}
                        </button>
                        {hasCustomPhoto && (
                          <button
                            type="button"
                            onClick={() => handleResetPhoto(member.id)}
                            className="p-1 text-white/70 hover:text-white"
                            title="Ripristina foto originale predefinita"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Content Body */}
                  <div className="p-6 space-y-4">
                    {/* Name and Role */}
                    <div>
                      <h3 className="font-editorial text-2xl font-bold text-[#10263D] leading-tight">
                        {member.name}
                      </h3>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#B45F42] mt-1">
                        {member.role}
                      </p>
                    </div>

                    {/* Legal Note if applicable */}
                    {member.legalNote && (
                      <div className="p-2.5 bg-[#FCFAF6] border border-[#E7DED4] rounded text-[11px] text-[#536176] flex items-start gap-1.5 leading-snug">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#B45F42] shrink-0 mt-0.5" />
                        <span>{member.legalNote}</span>
                      </div>
                    )}

                    {/* Bio */}
                    <p className="text-xs sm:text-sm text-[#536176] leading-relaxed">
                      {member.bio}
                    </p>

                    {/* Specialties */}
                    <div className="pt-3 border-t border-[#E7DED4]/60">
                      <span className="text-[11px] font-bold text-[#10263D] block mb-2 uppercase tracking-wider">
                        Ambiti di competenza:
                      </span>
                      <div className="space-y-1">
                        {member.specialties.map((spec, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-[#173650]">
                            <span className="text-[#B45F42] font-bold">·</span>
                            <span>{spec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Languages Footer */}
                <div className="p-4 bg-[#FCFAF6] border-t border-[#E7DED4] flex items-center justify-between text-xs text-[#536176]">
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-[#B45F42]" />
                    <span className="font-medium text-[#10263D]">Lingue:</span>
                  </div>
                  <span className="text-[11px] font-medium text-right text-[#173650]">
                    {member.languages.join(' · ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
