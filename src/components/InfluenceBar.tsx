interface InfluenceBarProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const InfluenceBar = ({ score, showLabel = true, size = 'md' }: InfluenceBarProps) => {
  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const getGradient = (score: number) => {
    if (score >= 80) return 'from-primary to-node-blue';
    if (score >= 60) return 'from-success to-node-green';
    if (score >= 40) return 'from-accent to-node-orange';
    return 'from-muted-foreground to-muted';
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <div className={`influence-bar flex-1 ${heights[size]}`}>
        <div
          className={`influence-bar-fill bg-gradient-to-r ${getGradient(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      {showLabel && (
        <span className="font-mono text-sm text-muted-foreground w-12 text-right">
          {score}%
        </span>
      )}
    </div>
  );
};
