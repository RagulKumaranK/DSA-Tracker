export default function DifficultyBadge({ difficulty }) {
  const map = {
    EASY: 'badge badge-easy',
    MEDIUM: 'badge badge-medium',
    HARD: 'badge badge-hard',
  };
  return (
    <span className={map[difficulty] || 'badge'}>
      {difficulty?.charAt(0) + difficulty?.slice(1).toLowerCase()}
    </span>
  );
}
