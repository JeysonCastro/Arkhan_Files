import React from 'react';

// Props shared perfectly across all SVG layers
export interface AvatarLayerProps {
    fill?: string;
    className?: string;
    style?: React.CSSProperties;
}

// -----------------------------------------------------------------
// BASE (SKIN/BODY) - COMIC STYLE
// -----------------------------------------------------------------
export const BaseSkin1 = ({ fill = "#fcd4c9", className, style }: AvatarLayerProps) => (
    <svg viewBox="0 0 200 250" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        {/* Neck Background/Shadow */}
        <path d="M75,140 L70,200 L130,200 L125,140 Z" fill="rgba(0,0,0,0.15)" />
        {/* Neck */}
        <path d="M75,140 C75,170 70,200 70,200 C90,210 110,210 130,200 C130,200 125,170 125,140" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />
        {/* Neck Strong Shadow (Comic Style Cut) */}
        <path d="M75,140 C90,150 110,150 125,140 L125,160 L75,160 Z" fill="rgba(0,0,0,0.2)" />

        {/* Shoulders */}
        <path d="M70,180 C40,180 15,220 15,250 L185,250 C185,220 160,180 130,180 Z" fill={fill} stroke="#111" strokeWidth="3" />

        {/* Head Shape (Centered & Comic Style Cut) */}
        {/* Adjusted to be perfectly centered on X=100. Width from 55 to 145 = 90px width. Height from 20 to 180 */}
        <path d="M55,90 C55,145 65,175 80,185 C90,190 110,190 120,185 C135,175 145,145 145,90 C145,30 135,20 100,20 C65,20 55,30 55,90 Z" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />

        {/* Ears (Angular) */}
        <path d="M55,95 L42,100 L42,120 L55,115" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />
        <path d="M145,95 L158,100 L158,120 L145,115" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />

        {/* Nose (Comic shaded line) */}
        <path d="M100,90 L95,125 L105,125" fill="rgba(0,0,0,0.1)" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M105,120 C112,120 112,125 105,125" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const BaseSkin2 = ({ fill = "#fcd4c9", className, style }: AvatarLayerProps) => (
    <svg viewBox="0 0 200 250" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        <path d="M75,140 L70,200 L130,200 L125,140 Z" fill="rgba(0,0,0,0.15)" />
        <path d="M75,140 C75,170 70,200 70,200 C90,210 110,210 130,200 C130,200 125,170 125,140" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />
        <path d="M75,140 C90,150 110,150 125,140 L125,160 L75,160 Z" fill="rgba(0,0,0,0.2)" />

        <path d="M70,180 C40,180 15,220 15,250 L185,250 C185,220 160,180 130,180 Z" fill={fill} stroke="#111" strokeWidth="3" />

        {/* Head Shape: ROUNDER */}
        <path d="M50,90 C50,150 60,180 85,190 C95,195 105,195 115,190 C140,180 150,150 150,90 C150,30 135,10 100,10 C65,10 50,30 50,90 Z" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />

        {/* Ears */}
        <path d="M50,95 L38,100 L38,115 L50,115" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />
        <path d="M150,95 L162,100 L162,115 L150,115" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />

        <path d="M100,90 L95,125 L105,125" fill="rgba(0,0,0,0.1)" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M105,120 C112,120 112,125 105,125" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const BaseSkin3 = ({ fill = "#fcd4c9", className, style }: AvatarLayerProps) => (
    <svg viewBox="0 0 200 250" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        <path d="M75,140 L70,200 L130,200 L125,140 Z" fill="rgba(0,0,0,0.15)" />
        <path d="M75,140 C75,170 70,200 70,200 C90,210 110,210 130,200 C130,200 125,170 125,140" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />
        <path d="M75,140 C90,150 110,150 125,140 L125,160 L75,160 Z" fill="rgba(0,0,0,0.2)" />

        <path d="M70,180 C40,180 15,220 15,250 L185,250 C185,220 160,180 130,180 Z" fill={fill} stroke="#111" strokeWidth="3" />

        {/* Head Shape: SHARP / ANGULAR */}
        <path d="M60,90 L55,145 L70,175 L90,195 L100,195 L110,195 L130,175 L145,145 L140,90 L135,25 L100,20 L65,25 Z" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />

        {/* Ears */}
        <path d="M58,95 L45,95 L45,120 L60,110" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />
        <path d="M142,95 L155,95 L155,120 L140,110" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />

        <path d="M100,90 L95,125 L105,125" fill="rgba(0,0,0,0.1)" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M105,120 C112,120 112,125 105,125" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

// -----------------------------------------------------------------
// EYES
// -----------------------------------------------------------------
export const EyesNormal = ({ fill = "#000", className, style }: AvatarLayerProps) => (
    <svg viewBox="0 0 200 250" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        {/* Left */}
        <path d="M65,95 C75,88 85,95 85,95 C80,100 70,100 65,95 Z" fill="#fff" stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="75" cy="94" r="3.5" fill={fill} />
        <circle cx="74" cy="93" r="1" fill="#fff" /> {/* Highligh */}
        {/* Right */}
        <path d="M115,95 C115,95 125,88 135,95 C130,100 120,100 115,95 Z" fill="#fff" stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="125" cy="94" r="3.5" fill={fill} />
        <circle cx="124" cy="93" r="1" fill="#fff" />

        {/* Eyebrows */}
        <path d="M60,82 L85,82" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" />
        <path d="M115,82 L140,82" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" />
    </svg>
);

export const EyesDetermined = ({ fill = "#000", className, style }: AvatarLayerProps) => (
    <svg viewBox="0 0 200 250" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        <path d="M65,95 L85,92 L85,97 L65,95 Z" fill="#fff" stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="75" cy="94" r="2.5" fill={fill} />

        <path d="M115,92 L135,95 L135,97 L115,92 Z" fill="#fff" stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="125" cy="94" r="2.5" fill={fill} />

        {/* Angry / Determined Eyebrows */}
        <path d="M60,80 L85,88" fill="none" stroke="#111" strokeWidth="5" strokeLinecap="round" />
        <path d="M115,88 L140,80" fill="none" stroke="#111" strokeWidth="5" strokeLinecap="round" />
    </svg>
);

export const EyesTired = ({ fill = "#000", className, style }: AvatarLayerProps) => (
    <svg viewBox="0 0 200 250" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        <path d="M65,95 C75,90 85,95 85,95 C85,95 75,95 65,95 Z" fill="#fff" stroke="#111" strokeWidth="2.5" />
        <circle cx="75" cy="94" r="2" fill={fill} />
        {/* Bags under eyes */}
        <path d="M65,98 C75,108 85,98 85,98" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="2.5" strokeLinecap="round" />

        <path d="M115,95 C115,95 125,90 135,95 C135,95 125,95 115,95 Z" fill="#fff" stroke="#111" strokeWidth="2.5" />
        <circle cx="125" cy="94" r="2" fill={fill} />
        {/* Bags */}
        <path d="M115,98 C125,108 135,98 135,98" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Eyebrows slightly raised in middle */}
        <path d="M65,80 L85,75" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" />
        <path d="M115,75 L135,80" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" />
    </svg>
);

export const EyesFeminine = ({ fill = "#000", className, style }: AvatarLayerProps) => (
    <svg viewBox="0 0 200 250" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        <path d="M65,95 C75,85 85,95 85,95 C80,102 70,102 65,95 Z" fill="#fff" stroke="#111" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="75" cy="94" r="4" fill={fill} />
        <circle cx="73" cy="92" r="1.5" fill="#fff" />
        {/* Eyelashes */}
        <path d="M65,95 C70,90 75,88 85,95" fill="none" stroke="#111" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M65,95 L60,92 M68,91 L65,88" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" />

        <path d="M115,95 C115,95 125,85 135,95 C130,102 120,102 115,95 Z" fill="#fff" stroke="#111" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="125" cy="94" r="4" fill={fill} />
        <circle cx="127" cy="92" r="1.5" fill="#fff" />
        {/* Eyelashes */}
        <path d="M115,95 C125,88 130,90 135,95" fill="none" stroke="#111" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M135,95 L140,92 M132,91 L135,88" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" />

        <path d="M65,80 Q75,75 85,82" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M115,82 Q125,75 135,80" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
);


// -----------------------------------------------------------------
// MOUTHS
// -----------------------------------------------------------------
export const MouthNeutral = ({ fill = "rgba(0,0,0,0.8)", className, style }: AvatarLayerProps) => (
    <svg viewBox="0 0 200 250" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        <path d="M85,140 L115,140" fill="none" stroke={fill} strokeWidth="3" strokeLinecap="round" />
        <path d="M95,145 L105,145" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const MouthSmirk = ({ fill = "rgba(0,0,0,0.8)", className, style }: AvatarLayerProps) => (
    <svg viewBox="0 0 200 250" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        <path d="M85,145 C95,145 105,140 115,135" fill="none" stroke={fill} strokeWidth="3" strokeLinecap="round" />
        <path d="M112,135 L116,131" fill="none" stroke={fill} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
);

export const MouthWorried = ({ fill = "rgba(0,0,0,0.8)", className, style }: AvatarLayerProps) => (
    <svg viewBox="0 0 200 250" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        <path d="M85,142 C92,138 108,138 115,142" fill="none" stroke={fill} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
);


// -----------------------------------------------------------------
// HAIR (Adjusted for new centered head)
// -----------------------------------------------------------------
export const HairSlickedBack = ({ fill = "#222", className, style }: AvatarLayerProps) => (
    <svg viewBox="0 0 200 250" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        {/* Base Block */}
        <path d="M52,95 C48,20 100,15 148,95 C145,55 100,30 52,95 Z" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />
        {/* Top Volume */}
        <path d="M48,80 C35,35 100,5 152,80 C130,25 70,25 48,80 Z" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />
        {/* Hair lines */}
        <path d="M65,45 C100,15 135,45 135,45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        <path d="M75,55 C100,25 125,55 125,55" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        {/* Sideburns */}
        <path d="M52,80 L52,105 L58,105 L58,80 Z" fill={fill} stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M148,80 L148,105 L142,105 L142,80 Z" fill={fill} stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
);

export const HairBob = ({ fill = "#4a2e1b", className, style }: AvatarLayerProps) => (
    <svg viewBox="0 0 200 250" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        {/* Back/Sides */}
        <path d="M42,125 C35,15 165,15 158,125 C153,145 143,125 143,125 C130,45 70,45 57,125 C57,125 47,145 42,125 Z" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />
        {/* Bangs (Franja) sharp Comic cut */}
        <path d="M48,65 C72,80 128,80 152,65 L145,50 C118,50 82,50 55,50 Z" fill={fill} stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M80,50 L80,75 M100,50 L100,77 M120,50 L120,75" fill="none" stroke="#111" strokeWidth="2" />
    </svg>
);

export const HairMessy = ({ fill = "#7a3b3b", className, style }: AvatarLayerProps) => (
    <svg viewBox="0 0 200 250" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        {/* Spikes / Messy anime style */}
        <path d="M50,95 L35,70 L58,58 L55,28 L78,38 L95,15 L112,35 L132,20 L145,45 L165,35 L152,68 L168,88 L150,95 C140,55 60,55 50,95 Z" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />
        {/* Front spikes */}
        <path d="M53,50 L63,88 L73,60 L85,85 L100,55 L115,85 L128,60 L138,88 L148,50 C120,35 80,35 53,50 Z" fill={fill} stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
        {/* Sideburns long */}
        <path d="M52,85 L46,120 L58,102 Z" fill={fill} stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M148,85 L154,120 L142,102 Z" fill={fill} stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
);

export const HairBun = ({ fill = "#111", className, style }: AvatarLayerProps) => (
    <svg viewBox="0 0 200 250" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        {/* Coque (Elizabeth style) */}
        <circle cx="100" cy="20" r="25" fill={fill} stroke="#111" strokeWidth="3" />
        <path d="M85,15 C95,25 115,10 115,10" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4" />
        {/* Main Hair wrap */}
        <path d="M50,98 C45,45 155,45 150,98 C138,50 62,50 50,98 Z" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />
        <path d="M63,98 L68,60 M137,98 L132,60 M100,50 L100,25" fill="none" stroke="#111" strokeWidth="1.5" />
        {/* Drooping side strands */}
        <path d="M50,98 C45,115 58,135 58,135 C58,135 52,115 54,98 Z" fill={fill} stroke="#111" strokeWidth="2" />
        <path d="M150,98 C155,115 142,135 142,135 C142,135 148,115 146,98 Z" fill={fill} stroke="#111" strokeWidth="2" />
    </svg>
);

// -----------------------------------------------------------------
// CLOTHES
// -----------------------------------------------------------------
export const ClothesSuit = ({ fill = "#1c2331", className, style }: AvatarLayerProps) => (
    <svg viewBox="0 0 200 250" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        <path d="M15,250 C15,220 35,180 70,180 L100,220 L130,180 C165,180 185,220 185,250 Z" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />
        {/* Shirt */}
        <path d="M75,181 L100,220 L125,181 Z" fill="#e8e8e8" stroke="#111" strokeWidth="2.5" />
        {/* Tie */}
        <path d="M93,205 L107,205 L100,250 Z" fill="#882222" stroke="#111" strokeWidth="2.5" />
        {/* Lapels */}
        <path d="M70,180 L85,220 L75,250 L60,250 M130,180 L115,220 L125,250 L140,250" fill="none" stroke="#111" strokeWidth="3" />
        {/* Folds */}
        <path d="M40,200 L45,250 M160,200 L155,250" fill="none" stroke="#111" strokeWidth="2" opacity="0.6" />
    </svg>
);

export const ClothesFlapperDress = ({ fill = "#225533", className, style }: AvatarLayerProps) => (
    <svg viewBox="0 0 200 250" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        {/* Shoulders slightly lower */}
        <path d="M30,250 C30,220 50,185 70,185 L130,185 C150,185 170,220 170,250 Z" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />
        {/* Straps / Details */}
        <path d="M50,250 L75,185 M150,250 L125,185" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
        {/* Pearl Necklace */}
        <path d="M75,195 C90,230 110,230 125,195" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 7" />
    </svg>
);

export const ClothesTurtleneck = ({ fill = "#aa2222", className, style }: AvatarLayerProps) => (
    // Joe style
    <svg viewBox="0 0 200 250" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        {/* Neck collar */}
        <path d="M70,195 L72,165 C85,175 115,175 128,165 L130,195 Z" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />
        {/* Folds on collar */}
        <path d="M80,170 L80,185 M100,170 L100,190 M120,170 L120,185" fill="none" stroke="#111" strokeWidth="2" opacity="0.6" />
        {/* Body */}
        <path d="M15,250 C15,220 35,190 70,190 C90,195 110,195 130,190 C165,190 185,220 185,250 Z" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />
        {/* Shoulder wrinkles */}
        <path d="M40,210 L35,250 M160,210 L165,250" fill="none" stroke="#111" strokeWidth="2" opacity="0.7" />
    </svg>
);

export const ClothesLabCoat = ({ fill = "#e8e8e8", className, style }: AvatarLayerProps) => (
    // Elizabeth style (White jacket over purple shirt)
    <svg viewBox="0 0 200 250" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        {/* Inner Shirt (Purple/Lilac) */}
        <path d="M60,180 L140,180 L140,250 L60,250 Z" fill="#9977aa" stroke="#111" strokeWidth="3" />
        {/* Lab Coat */}
        <path d="M15,250 C15,220 35,180 70,180 L75,250 Z M185,250 C185,220 165,180 130,180 L125,250 Z" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />
        {/* Collar of Lab Coat */}
        <path d="M70,180 L80,240 M130,180 L120,240" fill="none" stroke="#111" strokeWidth="2" />
    </svg>
);


// -----------------------------------------------------------------
// HATS / ACCESSORIES
// -----------------------------------------------------------------
export const GlassesRound = ({ fill = "rgba(255,255,255,0.1)", className, style }: AvatarLayerProps) => (
    <svg viewBox="0 0 200 250" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        {/* Adjusted to center over Eyes at X=75 and X=125 */}
        <circle cx="75" cy="94" r="14" fill={fill} stroke="#111" strokeWidth="3" />
        <circle cx="125" cy="94" r="14" fill={fill} stroke="#111" strokeWidth="3" />
        {/* Connectors */}
        <path d="M89,94 L111,94" fill="none" stroke="#111" strokeWidth="3" />
        {/* Arms */}
        <path d="M61,94 L45,90" fill="none" stroke="#111" strokeWidth="3" />
        <path d="M139,94 L155,90" fill="none" stroke="#111" strokeWidth="3" />
        {/* Glare reflection */}
        <path d="M65,84 L80,99" fill="none" stroke="#fff" strokeWidth="3" opacity="0.6" strokeLinecap="round" />
        <path d="M115,84 L130,99" fill="none" stroke="#fff" strokeWidth="3" opacity="0.6" strokeLinecap="round" />
    </svg>
);
