export default function StatsCard({ label, value, icon, color = 'bg-blue-50 text-blue-600', change }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`${color} p-3 rounded-xl text-2xl`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {change !== undefined && (
          <p className={`text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </p>
        )}
      </div>
    </div>
  );
}
