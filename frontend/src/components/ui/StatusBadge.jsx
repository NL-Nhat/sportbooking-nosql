import React from 'react';
import { STATUS_MAP } from '../../constants/statuses.js';

export function StatusBadge({ status, customLabel }) {
  if (!status) return null;
  const config = STATUS_MAP[status] || { label: status, variant: 'default' };
  const label = customLabel || config.label;

  return (
    <span className={`badge badge-${config.variant}`}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: 'currentColor',
        display: 'inline-block'
      }} />
      {label}
    </span>
  );
}

export default StatusBadge;

