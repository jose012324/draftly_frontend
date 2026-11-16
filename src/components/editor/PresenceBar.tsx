import { useEffect, useState, type CSSProperties } from 'react';

import type { RealtimePeer, SocketStatus } from '../../types';
import { initialsOf } from '../../utils/format';
import { Avatar } from '../ui/Avatar';
import { colorForUser } from './RemoteSelections';

interface PresenceBarProps {
  peers: RealtimePeer[];
  currentUserId?: number;
  status: SocketStatus;
}

/**
 * Shows who else has the document open — the avatars carry the same colour
 * as that person's selection in the editor.
 */
export function PresenceBar({ peers, currentUserId, status }: PresenceBarProps) {
  const others = peers.filter((peer) => peer.id !== currentUserId);
  const isLive = status === 'open';

  return (
    <span className="presence">
      {others.length > 0 ? (
        <span className="presence__peers">
          {others.slice(0, 4).map((peer) => {
            const color = colorForUser(peer.id);
            return (
              <span
                key={peer.id}
                className="presence__avatar"
                style={{ '--peer-color': color.hex } as CSSProperties}
                title={`${peer.name} is viewing this document`}
              >
                <Avatar
                  user={{ full_name: peer.name, initials: initialsOf(peer.name) }}
                  size="sm"
                  tone="slate"
                />
              </span>
            );
          })}
          <span className="presence__label">
            {others.length === 1
              ? `${others[0].name} is here`
              : `${others.length} others are here`}
          </span>
        </span>
      ) : null}

      <span className={`presence__state presence__state--${isLive ? 'live' : 'offline'}`}>
        <span className="presence__dot" />
        {isLive ? 'Live' : 'Offline'}
      </span>
    </span>
  );
}

export default PresenceBar;
