import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ObjectItem } from '@/types/object';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export function useObjectsSocket(
  onObjectCreated: (object: ObjectItem) => void,
  onObjectDeleted: (id: string) => void
) {
  const socketRef = useRef<Socket | null>(null);
  const onCreatedRef = useRef(onObjectCreated);
  const onDeletedRef = useRef(onObjectDeleted);
  onCreatedRef.current = onObjectCreated;
  onDeletedRef.current = onObjectDeleted;

  useEffect(() => {
    const socket = io(SOCKET_URL, { autoConnect: true });
    socketRef.current = socket;

    socket.on('object:created', (obj: ObjectItem) => {
      onCreatedRef.current(obj);
    });
    socket.on('object:deleted', (payload: { id: string }) => {
      onDeletedRef.current(payload.id);
    });

    return () => {
      socket.off('object:created');
      socket.off('object:deleted');
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);
}
