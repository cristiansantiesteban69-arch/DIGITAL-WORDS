import { useJourney } from '../context/JourneyContext';
import { buildingLocal } from '../lib/journeyMap';

// Framed as blueprint-style annotations (index + label + one short line)
// rather than plain floating copy, matching the "engineering" aesthetic.
// Windows use BUILDING_LOCAL progress (0-1 across the construction
// narrative), each owning a slice roughly aligned to buildingConfig.STAGES.
const CAPTIONS = [
  {
    id: 'foundation',
    index: '01',
    label: 'Foundation',
    text: 'Every great digital experience starts with a strong foundation.',
    from: 0.02,
    to: 0.22,
  },
  {
    id: 'structure',
    index: '02',
    label: 'Structure',
    text: 'Build the system behind the experience.',
    from: 0.24,
    to: 0.43,
  },
  {
    id: 'design',
    index: '03',
    label: 'Design',
    text: 'Make it impossible to ignore.',
    from: 0.46,
    to: 0.58,
  },
  {
    id: 'development',
    index: '04',
    label: 'Development',
    text: 'Where ideas become reality.',
    from: 0.61,
    to: 0.83,
  },
  {
    id: 'interaction',
    index: '05',
    label: 'Interaction',
    text: 'Make digital feel alive.',
    from: 0.86,
    to: 1,
  },
];

function windowProgress(local, from, to) {
  const fadeIn = 0.04;
  if (local < from - fadeIn || local > to) return 0;
  if (local < from) return (local - (from - fadeIn)) / fadeIn;
  if (local > to - fadeIn) return Math.max(0, (to - local) / fadeIn);
  return 1;
}

export default function ScrollCaptions() {
  const { progress } = useJourney();
  const local = buildingLocal(progress);

  return (
    <div className="scroll-captions" aria-hidden="true">
      {CAPTIONS.map((c) => {
        const t = windowProgress(local, c.from, c.to);
        return (
          <div
            key={c.id}
            className="scroll-caption"
            style={{ opacity: t, transform: `translateY(${(1 - t) * 14}px)` }}
          >
            <span className="scroll-caption__index">{c.index}</span>
            <span className="scroll-caption__rule" />
            <span className="scroll-caption__text">
              <span className="scroll-caption__label">{c.label}</span>
              {c.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
