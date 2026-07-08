'use client'

import React from 'react'

export interface VectorAvatarProps {
  isSpeaking: boolean
  gender?: 'male' | 'female'
  skinColor?: string
  hairColor?: string
  hairStyle?: string
  eyeColor?: string
  speechText?: string
  speechRate?: number
}

function darkenColor(hex: string, percent: number): string {
  const cleanHex = hex.replace('#', '')
  const num = parseInt(cleanHex, 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, Math.max(0, (num >> 16) - amt))
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) - amt))
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) - amt))
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}

export default function VectorAvatar({
  isSpeaking = false,
  gender = 'male',
  skinColor = '#e5b88c', // Match the rich sandalwood skin tone
  hairColor = '#000000', // Rich black hair
  hairStyle = 'combed',
  eyeColor = '#5c4033', // Hazel/Brown eyes matching the image
  speechText = '',
  speechRate = 1,
}: VectorAvatarProps) {
  const isMale = gender === 'male'
  const skinShadow = darkenColor(skinColor, 15)
  const skinShadowDeep = darkenColor(skinColor, 25)
  const skinHighlight = darkenColor(skinColor, -12)

  // Gender-specific styling variations
  const lipColor = isMale ? '#b57373' : '#c96176'       // Natural vs Rose Lipstick
  const lipColorDark = isMale ? '#915151' : '#a33f54'   // Natural vs Dark Rose Lipstick
  const eyebrowWidth = isMale ? '3.3' : '2.0'            // Thicker eyebrows for male
  const cheekBlushOpacity = isMale ? '0.05' : '0.18'     // More prominent blush for female

  const spokenWords = speechText.trim().split(/\s+/).filter(Boolean).length
  const talkDuration = isSpeaking
    ? Math.max(0.8, Math.min(2.0, (1.4 / Math.max(0.7, speechRate)) + Math.max(0, spokenWords - 10) * 0.03))
    : 0
  const talkOpenness = isSpeaking
    ? Math.max(0.04, Math.min(0.12, Math.min(1, speechText.length / 240)))
    : 0
  const mouthStyle = isSpeaking
    ? ({
        animationDuration: `${talkDuration}s`,
        animationTimingFunction: 'ease-in-out',
        '--mouth-openness': `${talkOpenness}`,
      } as React.CSSProperties)
    : undefined

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden rounded-3xl p-1">
      {/* Avatar Container with breathing sway */}
      <div className="w-full max-w-[280px] aspect-square relative z-20 flex items-center justify-center animate-[sway_6s_ease-in-out_infinite]">
        <svg viewBox="0 0 200 210" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]">
          <defs>
            {/* Eye Iris Gradient */}
            <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
              <stop offset="0%" stopColor={darkenColor(eyeColor, -20)} />
              <stop offset="70%" stopColor={eyeColor} />
              <stop offset="100%" stopColor="#0b0704" />
            </radialGradient>

            {/* Lips Gradient */}
            <linearGradient id="lipsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isMale ? "#d18a8a" : "#e08498"} />
              <stop offset="60%" stopColor={lipColor} />
              <stop offset="100%" stopColor={lipColorDark} />
            </linearGradient>

            {/* Face lighting gradient */}
            <radialGradient id="faceLight" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor={skinHighlight} />
              <stop offset="60%" stopColor={skinColor} />
              <stop offset="100%" stopColor={skinShadow} />
            </radialGradient>
          </defs>

          {/* Slightly taller neck with shirt moved downward */}
          <path d="M 80 134 L 80 176 Q 100 190 120 176 L 120 134 Z" fill={skinShadowDeep} />
          
          {/* Neck Base */}
          <path d="M 83 138 L 83 176 C 83 188, 117 188, 117 176 L 117 138 Z" fill={skinShadow} />
          {/* Subtle Neck Crease Lines */}
          <path d="M 88 158 Q 100 162 112 158" fill="none" stroke={skinShadowDeep} strokeWidth="1.5" opacity="0.6" />
          <path d="M 91 166 Q 100 170 109 166" fill="none" stroke={skinShadowDeep} strokeWidth="1.5" opacity="0.5" />

          {/* Dress / clothing below the neck */}
          {isMale ? (
            <>
              <path d="M 46 178 C 62 156 74 152 84 152 H 116 C 126 152 138 156 154 178 L 154 210 L 46 210 Z" fill="#1e293b" />
              {/* <path d="M 84 152 L 100 142 L 116 152" fill="#192a42" /> */}
              {/* <path d="M 84 152 L 100 146 L 116 152" fill="#1e293b" opacity="0.95" /> */}
              <path d="M 92 156 L 108 156" fill="none" stroke="#8ca0b8" strokeWidth="2" opacity="0.8" />
              <circle cx="100" cy="166" r="2" fill="#cbd5e1" />
              <circle cx="100" cy="174" r="2" fill="#cbd5e1" />
              <circle cx="100" cy="182" r="2" fill="#cbd5e1" />
              <path d="M 46 178 C 60 170 70 164 84 160" fill="#1b2538" opacity="0.6" />
              <path d="M 154 178 C 140 170 130 164 116 160" fill="#1b2538" opacity="0.6" />
              <path d="M 60 190 C 68 202 76 212 84 216" fill="none" stroke="#192a42" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              <path d="M 140 190 C 132 202 124 212 116 216" fill="none" stroke="#192a42" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            </>
          ) : (
            <>
              <path d="M 46 178 C 62 156 74 152 84 152 H 116 C 126 152 138 156 154 178 L 154 210 L 46 210 Z" fill="#312e81" />
              <path d="M 56 178 C 64 162 74 152 84 152 H 116 C 126 152 136 162 144 178" fill="#24315a" opacity="0.9" />
              <path d="M 92 156 L 108 156" fill="none" stroke="#8ca0b8" strokeWidth="2" opacity="0.8" />
              <circle cx="100" cy="166" r="2" fill="#cbd5e1" />
              <circle cx="100" cy="174" r="2" fill="#cbd5e1" />
              <circle cx="100" cy="182" r="2" fill="#cbd5e1" />
              <path d="M 46 178 C 60 170 70 164 84 160" fill="#26204c" opacity="0.6" />
              <path d="M 154 178 C 140 170 130 164 116 160" fill="#26204c" opacity="0.6" />
              <path d="M 60 190 C 68 202 76 212 84 216" fill="none" stroke="#1b203e" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              <path d="M 140 190 C 132 202 124 212 116 216" fill="none" stroke="#1b203e" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            </>
          )}

          {/* Realistic Left Ear */}
          <g>
            {/* Outer ear helix */}
            <path d="M 56 86 C 48 86, 46 116, 56 120 C 63 123, 64 111, 61 104 C 61 97, 64 89, 64 86 Z" fill={skinShadow} stroke={skinShadowDeep} strokeWidth="1" />
            {/* Inner ear shadows */}
            <path d="M 54 94 Q 50 102 54 110" fill="none" stroke={skinShadowDeep} strokeWidth="1.5" />
            <path d="M 56 90 Q 52 98 55 104" fill="none" stroke={skinShadowDeep} strokeWidth="1" opacity="0.8" />
          </g>

          {/* Realistic Right Ear */}
          <g>
            {/* Outer ear helix */}
            <path d="M 144 86 C 152 86, 154 116, 144 120 C 137 123, 136 111, 139 104 C 139 97, 136 89, 136 86 Z" fill={skinShadow} stroke={skinShadowDeep} strokeWidth="1" />
            {/* Inner ear shadows */}
            <path d="M 146 94 Q 150 102 146 110" fill="none" stroke={skinShadowDeep} strokeWidth="1.5" />
            <path d="M 144 90 Q 148 98 145 104" fill="none" stroke={skinShadowDeep} strokeWidth="1" opacity="0.8" />
          </g>
          
          {/* Face Shape (Male: Slightly stronger jaw; Female: softer/curvier jaw) */}
          {isMale ? (
            <path d="M 58 84 C 58 44, 142 44, 142 84 C 142 118, 129 144, 100 145 C 71 145, 58 118, 58 84 Z" fill="url(#faceLight)" />
          ) : (
            <path d="M 60 86 C 60 48, 140 48, 140 86 C 140 120, 126 147, 100 148 C 74 148, 60 120, 60 86 Z" fill="url(#faceLight)" />
          )}

          {/* Both eyes blink together with a short pause */}
          <g className="animate-[blink_4s_infinite] origin-[100px_91px]">
            {/* Left Eye group */}
            <g>
              <path d="M 73 84 Q 82 81.5 91 84" fill="none" stroke={skinShadowDeep} strokeWidth="1" opacity="0.6" />
              <path d="M 74 91 C 74 87.7, 90 87.7, 90 91 C 90 94.3, 74 94.3, 74 91 Z" fill="#fdfbf7" />
              <circle cx="82" cy="91" r="4.2" fill="url(#irisGrad)" />
              <circle cx="82" cy="91" r="1.8" fill="#050302" />
              <circle cx="80.7" cy="89.7" r="1" fill="#ffffff" opacity="0.95" />
              <circle cx="83.5" cy="92.2" r="0.5" fill="#ffffff" opacity="0.6" />
              <path d="M 73 90 Q 82 86 91 90" fill="none" stroke="#261b12" strokeWidth="1.8" strokeLinecap="round" />
              {!isMale && (
                <path d="M 73 90 Q 70 85 74 83" fill="none" stroke="#261b12" strokeWidth="1.2" />
              )}
              <path d="M 74 92 Q 82 94.5 90 92" fill="none" stroke="#523927" strokeWidth="1" opacity="0.75" />
            </g>

            {/* Right Eye group */}
            <g>
              <path d="M 109 84 Q 118 81.5 127 84" fill="none" stroke={skinShadowDeep} strokeWidth="1" opacity="0.6" />
              <path d="M 110 91 C 110 87.7, 126 87.7, 126 91 C 126 94.3, 110 94.3, 110 91 Z" fill="#fdfbf7" />
              <circle cx="118" cy="91" r="4.2" fill="url(#irisGrad)" />
              <circle cx="118" cy="91" r="1.8" fill="#050302" />
              <circle cx="116.7" cy="89.7" r="1" fill="#ffffff" opacity="0.95" />
              <circle cx="119.5" cy="92.2" r="0.5" fill="#ffffff" opacity="0.6" />
              <path d="M 109 90 Q 118 86 127 90" fill="none" stroke="#261b12" strokeWidth="1.8" strokeLinecap="round" />
              {!isMale && (
                <path d="M 127 90 Q 130 85 126 83" fill="none" stroke="#261b12" strokeWidth="1.2" />
              )}
              <path d="M 110 92 Q 118 94.5 126 92" fill="none" stroke="#523927" strokeWidth="1" opacity="0.75" />
            </g>
          </g>

          {/* Eyebrows matching the curved model eyebrows */}
          <path d="M 68 81 C 74 77, 86 77, 94 82" fill="none" stroke={hairColor} strokeWidth={eyebrowWidth} strokeLinecap="round" opacity="0.85" />
          <path d="M 132 81 C 126 77, 114 77, 106 82" fill="none" stroke={hairColor} strokeWidth={eyebrowWidth} strokeLinecap="round" opacity="0.85" />

          {/* Detailed Nose with nostrils and light bridge reflection */}
          <g>
            {/* Nose Bridge Soft Shading */}
            <path d="M 97 89 L 96 112 Q 100 115 104 112 L 103 89" fill={skinShadow} opacity="0.45" />
            {/* Nose Tip Bulb */}
            <circle cx="100" cy="112" r="4.5" fill={skinColor} />
            <circle cx="100" cy="112" r="4.5" fill={skinHighlight} opacity="0.25" />
            {/* Left Nostril Wing */}
            <path d="M 93 113 Q 95 109 98 113" fill="none" stroke={skinShadowDeep} strokeWidth="1.8" strokeLinecap="round" />
            {/* Right Nostril Wing */}
            <path d="M 107 113 Q 105 109 102 113" fill="none" stroke={skinShadowDeep} strokeWidth="1.8" strokeLinecap="round" />
            {/* Nostrils Cavity Shadows */}
            <ellipse cx="97" cy="114" rx="1.5" ry="0.8" fill="#1f1107" opacity="0.6" />
            <ellipse cx="103" cy="114" rx="1.5" ry="0.8" fill="#1f1107" opacity="0.6" />
          </g>

          {/* Rosy cheek shading */}
          <ellipse cx="64" cy="112" rx="7" ry="5" fill="#f43f5e" opacity={cheekBlushOpacity} />
          <ellipse cx="136" cy="112" rx="7" ry="5" fill="#f43f5e" opacity={cheekBlushOpacity} />

          {/* Lips (professional natural mouth) */}
          <g>
            {isSpeaking ? (
              /* Talking mouth with very gentle opening */
              <g className="animate-[talkMouth_infinite] origin-[100px_130px]" style={mouthStyle}>
                {/* Mouth cavity */}
                <path d="M 86 129 C 92 132, 108 132, 114 129 C 108 138, 92 138, 86 129 Z" fill={isMale ? '#3d111a' : '#4a162d'} opacity="0.92" />
                {/* Teeth curve */}
                <path d="M 92 131 C 98 133, 102 133, 108 131" fill="none" stroke="#f9f5f2" strokeWidth="0.8" opacity="0.95" strokeLinecap="round" />
                {/* Tongue highlight */}
                <path d="M 92 135 C 98 138, 102 138, 108 135 C 102 140, 98 140, 92 135 Z" fill="#c86d79" opacity="0.72" />
                {/* Upper Lip */}
                <path d="M 86 129 C 94 125, 106 125, 114 129 C 100 127, 96 126, 86 129 Z" fill="url(#lipsGrad)" />
                {/* Lower Lip */}
                <path d="M 86 129 C 94 133, 106 133, 114 129 C 100 131, 96 132, 86 129 Z" fill="url(#lipsGrad)" opacity="0.96" />
              </g>
            ) : (
              /* Idle neutral lips */
              <g>
                <path d="M 90 128 C 95 133, 105 133, 110 128 C 100 131, 95 131, 90 128 Z" fill="url(#lipsGrad)" />
                <path d="M 90 128 C 95 123, 105 123, 110 128 C 100 125, 95 124, 90 128 Z" fill="url(#lipsGrad)" />
                <path d="M 94 130 C 98 132, 102 132, 102 132" fill="none" stroke={lipColorDark} strokeWidth="0.7" opacity="0.8" strokeLinecap="round" />
              </g>
            )}
          </g>

          {/* Neatly Combed Hair Style matching the side-parted reference image */}
          {hairStyle !== 'bald' && (
            <g fill={hairColor} transform="translate(0, -15)">
              {/* Back volume of hair */}
              <path d="M 55 78 C 52 22, 148 22, 145 78 C 145 82, 142 86, 142 86 C 142 86, 58 86, 58 86 C 58 86, 54 82, 55 78 Z" />
              
              {/* Extra back/shoulder hair for female */}
              {!isMale && (
                <>
                  <path d="M 48 75 C 37 75, 37 125, 43 145 C 48 155, 70 155, 66 145 C 62 132, 59 105, 59 75 Z" />
                  <path d="M 152 75 C 163 75, 163 125, 157 145 C 152 155, 130 155, 134 145 C 138 132, 141 105, 141 75 Z" />
                </>
              )}

              {/* Left side hair wrapping around the temple and above the ear */}
              <path d="M 58 54 C 54 50, 46 62, 46 74 C 46 86, 54 94, 60 96 C 62 92, 64 84, 64 74 C 64 66, 60 58, 58 54 Z" />
              {/* Right side hair wrapping around the temple and above the ear */}
              <path d="M 142 54 C 146 50, 154 62, 154 74 C 154 86, 146 94, 140 96 C 138 92, 136 84, 136 74 C 136 66, 140 58, 142 54 Z" />

              {/* Left Sideburn / Side Hair framing the face */}
              <path d="M 56 58 C 53 58, 53 82, 54 98 C 58 98, 58 80, 58 64 Z" />
              {/* Right Sideburn / Side Hair framing the face */}
              <path d="M 144 58 C 147 58, 147 82, 146 98 C 142 98, 142 80, 142 64 Z" />

              {/* Male extra hair volume above ear sides */}
              {isMale && (
                <>
                  {/* Left side bulk and layered strands */}
                  <path d="M 58 46 C 45 52, 45 74, 52 84 C 57 84, 58 74, 58 60 Z" />
                  <path d="M 48 58 Q 55 68 58 74" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.15" />
                  {/* Right side bulk and layered strands */}
                  <path d="M 142 46 C 155 52, 155 74, 148 84 C 143 84, 142 74, 142 60 Z" />
                  <path d="M 152 58 Q 145 68 142 74" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.15" />
                </>
              )}
              
              {/* Shorter front strands for female */}
              {!isMale && (
                <>
                  <path d="M 54 64 C 52 72, 52 80, 56 88 C 57 88, 58 84, 57 80 C 57 76, 56 70, 54 64 Z" />
                  <path d="M 146 64 C 148 72, 148 80, 144 88 C 143 88, 142 84, 143 80 C 143 76, 142 70, 146 64 Z" />
                </>
              )}

              {/* Sleek side-parted combed hair strands overlay shifted up */}
              {/* Left Side Combed down */}
              <path d="M 54 65 C 54 40, 88 30, 98 44 C 98 52, 80 54, 62 58 C 58 56, 54 56, 54 65 Z" />
              {/* Right Side Swept over */}
              <path d="M 96 40 C 96 26, 140 30, 146 58 C 146 62, 142 66, 138 66 C 124 66, 104 54, 96 40 Z" />
            </g>
          )}
        </svg>
      </div>

      <style jsx global>{`
        @keyframes sway {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(0.6deg); }
        }
        @keyframes blink {
          0%, 95%, 100% { transform: scaleY(1); }
          97.5% { transform: scaleY(0.05); }
        }
        @keyframes talkMouth {
          0%, 100% { transform: translateY(0px) scaleY(0.94); }
          16% { transform: translateY(0.4px) scaleY(calc(0.96 + var(--mouth-openness, 0.08))); }
          34% { transform: translateY(0.0px) scaleY(calc(0.92 + var(--mouth-openness, 0.08))); }
          52% { transform: translateY(0.3px) scaleY(calc(0.98 + var(--mouth-openness, 0.08))); }
          70% { transform: translateY(0.1px) scaleY(calc(0.94 + var(--mouth-openness, 0.08))); }
          88% { transform: translateY(0.2px) scaleY(calc(0.95 + var(--mouth-openness, 0.08))); }
        }
      `}</style>
    </div>
  )
}
