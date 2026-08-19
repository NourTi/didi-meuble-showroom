type DidiLogoProps = { className?: string; compact?: boolean };

export default function DidiLogo({ className = "", compact = false }: DidiLogoProps) {
  return <div className={`didi-logo ${compact ? "compact" : ""} ${className}`} aria-label="Didi Meuble"><img src="/manus-storage/didi-meuble-logo_51fd7ef8.jpg" alt="Didi Meuble" width="72" height="72" />{!compact && <span className="didi-logo__word">DIDI<br /><em>MEUBLE</em></span>}</div>;
}
