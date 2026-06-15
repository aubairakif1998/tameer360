const PARTICLES = [
  { left: '8%', delay: '0s', duration: '18s', size: 3 },
  { left: '18%', delay: '4s', duration: '22s', size: 2 },
  { left: '32%', delay: '2s', duration: '20s', size: 2 },
  { left: '48%', delay: '7s', duration: '24s', size: 3 },
  { left: '62%', delay: '1s', duration: '19s', size: 2 },
  { left: '74%', delay: '5s', duration: '21s', size: 2 },
  { left: '88%', delay: '3s', duration: '23s', size: 3 },
  { left: '42%', delay: '9s', duration: '26s', size: 2 },
  { left: '55%', delay: '11s', duration: '20s', size: 2 },
  { left: '26%', delay: '6s', duration: '25s', size: 2 },
];

export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="ambient-orb ambient-orb-a" />
      <div className="ambient-orb ambient-orb-b" />
      <div className="ambient-orb ambient-orb-c" />

      <div className="ambient-beam" />

      {PARTICLES.map((particle, index) => (
        <span
          key={index}
          className="ambient-particle absolute bottom-0 rounded-full bg-amber-200/40"
          style={{
            left: particle.left,
            width: particle.size,
            height: particle.size,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(9,9,11,0.35)_50%,rgba(9,9,11,0.92)_100%)]" />
    </div>
  );
}
