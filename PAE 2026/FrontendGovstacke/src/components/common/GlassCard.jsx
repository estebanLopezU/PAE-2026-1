export default function GlassCard({ children, className = '', style }) {
  return (
    <div className={`glass-card rounded-2xl ${className}`} style={style}>
      {children}
    </div>
  )
}