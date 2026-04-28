import React from 'react';

function prettyTime(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function RequestHistory({ items, onSelect }) {
  if (!items || items.length === 0) {
    return <p className="history-empty">No recent prompts yet.</p>;
  }

  return (
    <ul className="history-list">
      {items.map((item) => (
        <li key={item.id}>
          <button type="button" onClick={() => onSelect(item)}>
            <div>
              <strong>{item.mood}</strong>
              {item.genre && <span> · {item.genre}</span>}
              {item.activity && <span> · {item.activity}</span>}
            </div>
            <small>{prettyTime(item.createdAt)}</small>
          </button>
        </li>
      ))}
    </ul>
  );
}
