import React from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({ icon: Icon = Inbox, title = 'Chưa có dữ liệu', description, action }) {
  return (
    <div style={{
      padding: '48px 24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--sb-surface)',
      borderRadius: 'var(--sb-radius-lg)',
      border: '1px dashed var(--sb-border)',
      margin: '16px 0'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'var(--sb-primary-50)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--sb-primary-600)',
        marginBottom: '16px'
      }}>
        <Icon size={32} />
      </div>
      <h4 style={{ margin: '0 0 8px 0', color: 'var(--sb-text-primary)' }}>{title}</h4>
      {description && (
        <p style={{ margin: '0 0 20px 0', maxWidth: '400px', fontSize: '0.9rem', color: 'var(--sb-text-secondary)' }}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export default EmptyState;

