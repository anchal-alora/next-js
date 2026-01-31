"use client";

import { FileSearch, Compass, Users, Award, Search, Target, Handshake, TrendingUp } from "lucide-react";

interface CareerLevel {
  level: string;
  description: string;
  cardIcon: React.ElementType;
  stepIcon: React.ElementType;
  stepLabel: string;
  stepWidth: number;
  stepHeight: number;
  stepY: number;
  stepX: number;
  cardX: number;
  cardY: number;
}

// Consistent dimensions
const STEP_WIDTH = 200;
const STEP_HEIGHT = 60;
const CARD_WIDTH = 190; // Match step width for consistency
const CARD_HEIGHT = 90;

const careerLevels: CareerLevel[] = [
  { 
    level: "Associate", 
    description: "Build foundational research and consulting skills.",
    cardIcon: FileSearch,
    stepIcon: Search,
    stepLabel: "Research",
    stepWidth: STEP_WIDTH,
    stepHeight: STEP_HEIGHT,
    stepY: 290,
    stepX: 50,
    cardX: 50 + (STEP_WIDTH - CARD_WIDTH) / 2,
    cardY: 195,
  },
  { 
    level: "Consultant", 
    description: "Own workstreams and contribute to client-facing problem solving.",
    cardIcon: Compass,
    stepIcon: Target,
    stepLabel: "Strategic Thinking",
    stepWidth: STEP_WIDTH,
    stepHeight: STEP_HEIGHT,
    stepY: 230,
    stepX: 250,
    cardX: 250 + (STEP_WIDTH - CARD_WIDTH) / 2,
    cardY: 135,
  },
  { 
    level: "Engagement Lead", 
    description: "Lead engagements and shape strategic recommendations.",
    cardIcon: Users,
    stepIcon: Handshake,
    stepLabel: "Client Relationships",
    stepWidth: STEP_WIDTH,
    stepHeight: STEP_HEIGHT,
    stepY: 170,
    stepX: 450,
    cardX: 450 + (STEP_WIDTH - CARD_WIDTH) / 2,
    cardY: 75,
  },
  { 
    level: "Partner", 
    description: "Guide client relationships and firm direction.",
    cardIcon: Award,
    stepIcon: TrendingUp,
    stepLabel: "Leadership",
    stepWidth: STEP_WIDTH,
    stepHeight: STEP_HEIGHT,
    stepY: 110,
    stepX: 650,
    cardX: 650 + (STEP_WIDTH - CARD_WIDTH) / 2,
    cardY: 15,
  },
];

export default function CareerJourney() {
  const skylineHref = "/assets/site/skyline.png";

  // Calculate stepped path (ladder only)
  const pathPoints = [
    { x: 50, y: careerLevels[0].stepY },
    { x: careerLevels[0].stepX + careerLevels[0].stepWidth, y: careerLevels[0].stepY },
    { x: careerLevels[0].stepX + careerLevels[0].stepWidth, y: careerLevels[1].stepY },
    { x: careerLevels[1].stepX + careerLevels[1].stepWidth, y: careerLevels[1].stepY },
    { x: careerLevels[1].stepX + careerLevels[1].stepWidth, y: careerLevels[2].stepY },
    { x: careerLevels[2].stepX + careerLevels[2].stepWidth, y: careerLevels[2].stepY },
    { x: careerLevels[2].stepX + careerLevels[2].stepWidth, y: careerLevels[3].stepY },
    { x: careerLevels[3].stepX + careerLevels[3].stepWidth, y: careerLevels[3].stepY },
  ];

  const pathD = pathPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Closed path for gradient fill - extends to bottom of first step
  const bottomY = careerLevels[0].stepY + careerLevels[0].stepHeight; // Bottom of first step
  const fillPathPoints = [
    { x: 50, y: bottomY },
    ...pathPoints,
    { x: careerLevels[3].stepX + careerLevels[3].stepWidth, y: bottomY },
    { x: 50, y: bottomY },
  ];
  const fillPathD = fillPathPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  const viewBoxWidth = 900;
  const viewBoxHeight = 360;

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
        overflow="visible"
      >
        <defs>
          <linearGradient id="stepGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7F33CC" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#51087E" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="ladderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EFDDF9" />
            <stop offset="50%" stopColor="#A020F0" />
            <stop offset="100%" stopColor="#6E2DAF" />
          </linearGradient>
          <filter id="ladderShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Background image - skyline */}
        {skylineHref ? (
          <image
            href={skylineHref}
            x="50"
            y="0"
            width="560"
            height="360"
            preserveAspectRatio="xMidYMid slice"
            opacity="0.3"
          />
        ) : null}

        {/* Gradient fill under steps */}
        <path d={fillPathD} fill="url(#stepGradient)" stroke="none" />

        {/* Stepped path outline (ladder line only) */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#ladderGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#ladderShadow)"
        />

        {/* Step boxes and cards */}
        {careerLevels.map((level) => {
          const CardIcon = level.cardIcon;
          const StepIcon = level.stepIcon;

          return (
            <g key={level.level}>
              {/* Card above step */}
              <foreignObject x={level.cardX} y={level.cardY} width={CARD_WIDTH} height={CARD_HEIGHT}>
                <div className="h-full w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div className="h-full p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-accent/10">
                        <CardIcon className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
                      </div>
                      <span className="text-xs font-semibold text-foreground">{level.level}</span>
                    </div>
                    <p className="text-[10px] leading-tight text-muted-foreground">{level.description}</p>
                  </div>
                </div>
              </foreignObject>

              {/* Label inside step */}
              <foreignObject
                x={level.stepX + 5}
                y={level.stepY + (level.stepHeight - 28) / 2}
                width={level.stepWidth - 10}
                height="28"
              >
                <div className="h-full w-full flex items-center justify-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <StepIcon className="h-4 w-4" strokeWidth={2} style={{ color: '#281C2D' }} />
                  <span className="text-xs font-bold" style={{ color: '#281C2D' }}>{level.stepLabel}</span>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
