const STEPS = [
  { key: 'accepted', label: 'Accepted' },
  { key: 'ready', label: 'Ready' },
  { key: 'completed', label: 'Completed' },
];

const MESSAGES = {
  pending: 'Waiting for the lounge to accept your order.',
  preparing: 'Your food is being prepared.',
  ready: 'Your food is ready for pickup!',
  completed: 'Order completed. Enjoy your meal!',
  rejected: 'This order was rejected by the lounge.',
  cancelled: 'This order was cancelled.',
};

const ORDER_RANK = {
  pending: 0,
  accepted: 1,
  preparing: 1,
  ready: 2,
  completed: 3,
  rejected: -1,
  cancelled: -1,
};

function formatEta(iso) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  const diff = Math.max(0, Math.ceil((t - Date.now()) / 1000));
  if (diff <= 0) return 'Ready any moment…';
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return m > 0 ? `Ready in ~${m}m ${s}s` : `Ready in ~${s}s`;
}

function acceptedMessage(order) {
  const mins = order.prep_minutes;
  if (mins) {
    return `The lounge accepted your order. Estimated ready in about ${mins} minute${mins === 1 ? '' : 's'}.`;
  }
  return 'The lounge accepted your order and is preparing it.';
}

export default function OrderStatusTimeline({ order }) {
  const rank = ORDER_RANK[order.status] ?? 0;
  const message =
    order.status === 'accepted' ? acceptedMessage(order) : (MESSAGES[order.status] || `Status: ${order.status}`);
  const isReady = order.status === 'ready';
  const isActive = !['completed', 'rejected', 'cancelled'].includes(order.status);
  const eta =
    ['accepted', 'preparing'].includes(order.status) && order.estimated_ready_at
      ? formatEta(order.estimated_ready_at)
      : null;

  if (['rejected', 'cancelled'].includes(order.status)) {
    return (
      <div className="mt-3 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-800">
        {message}
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {isReady && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm font-medium text-green-800">
          {MESSAGES.ready}
        </div>
      )}
      {isActive && !isReady && (
        <p className="text-sm text-gray-600">{message}</p>
      )}
      {eta && !isReady && (
        <p className="text-sm font-medium text-primary">{eta}</p>
      )}
      {isActive && order.status !== 'pending' && (
        <div className="flex items-center gap-2 pt-1">
          {STEPS.map((step) => {
            const stepRank = ORDER_RANK[step.key];
            const done = rank >= stepRank;
            const current =
              order.status === step.key
              || (step.key === 'accepted' && order.status === 'preparing');
            return (
              <div key={step.key} className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className={`h-2 w-2 rounded-full shrink-0 ${
                    done ? 'bg-primary' : 'bg-gray-200'
                  } ${current ? 'ring-2 ring-primary/40' : ''}`}
                />
                <span
                  className={`text-xs truncate ${
                    current ? 'font-semibold text-primary' : done ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
