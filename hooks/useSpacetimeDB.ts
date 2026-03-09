'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { SPACETIMEDB_URL, GAME_NAME } from '@/lib/spacetimedb';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

interface TableUpdate {
  table: string;
  op: 'insert' | 'update' | 'delete';
  row: Record<string, unknown>;
}

type OnTableUpdate = (updates: TableUpdate[]) => void;

interface SpacetimeDBHook {
  status: ConnectionStatus;
  error: string | null;
  reconnectAttempt: number;
  connect: () => Promise<void>;
  disconnect: () => void;
  callReducer: (name: string, ...args: unknown[]) => void;
  onTableUpdate: (handler: OnTableUpdate) => void;
}

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 1000; // 1s
const MAX_RECONNECT_DELAY = 30000; // 30s

export function useSpacetimeDB(): SpacetimeDBHook {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);
  const tableUpdateHandlerRef = useRef<OnTableUpdate | null>(null);
  const intentionalCloseRef = useRef(false);
  const pendingReducerCalls = useRef<Array<{ name: string; args: unknown[] }>>([]);
  const connectRef = useRef<(() => Promise<void>) | null>(null);

  const onTableUpdate = useCallback((handler: OnTableUpdate) => {
    tableUpdateHandlerRef.current = handler;
  }, []);

  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const isReconnect = attemptRef.current > 0;
    setStatus(isReconnect ? 'reconnecting' : 'connecting');
    setError(null);
    intentionalCloseRef.current = false;

    try {
      const ws = new WebSocket(SPACETIMEDB_URL);

      ws.onopen = () => {
        setStatus('connected');
        setError(null);
        attemptRef.current = 0;
        setReconnectAttempt(0);

        // Re-subscribe on reconnect — request full state sync
        if (isReconnect) {
          ws.send(JSON.stringify({ type: 'resubscribe', module: GAME_NAME }));
        } else {
          ws.send(JSON.stringify({ type: 'subscribe', module: GAME_NAME }));
        }

        // Flush pending reducer calls queued while disconnected
        while (pendingReducerCalls.current.length > 0) {
          const call = pendingReducerCalls.current.shift()!;
          ws.send(JSON.stringify({ reducer: call.name, args: call.args }));
        }
      };

      ws.onclose = () => {
        if (intentionalCloseRef.current) {
          setStatus('disconnected');
          return;
        }

        // Auto-reconnect with exponential backoff
        attemptRef.current += 1;
        setReconnectAttempt(attemptRef.current);

        if (attemptRef.current <= MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(
            BASE_RECONNECT_DELAY * Math.pow(2, attemptRef.current - 1),
            MAX_RECONNECT_DELAY
          );
          setStatus('reconnecting');
          setError(`Reconnecting (${attemptRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);

          reconnectTimerRef.current = setTimeout(() => {
            connectRef.current?.();
          }, delay);
        } else {
          setStatus('error');
          setError('Connection lost. Please refresh the page.');
        }
      };

      ws.onerror = () => {
        setError('Connection error');
        setStatus('error');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle table updates from SpacetimeDB
          if (data.type === 'table_update' && tableUpdateHandlerRef.current) {
            tableUpdateHandlerRef.current(data.updates ?? []);
          }

          // Handle reducer responses
          if (data.type === 'reducer_result' && data.error) {
            setError(data.error);
            setTimeout(() => setError(null), 3000);
          }
        } catch {
          // Non-JSON message
        }
      };

      wsRef.current = ws;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const disconnect = useCallback(() => {
    intentionalCloseRef.current = true;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    wsRef.current?.close();
    wsRef.current = null;
    attemptRef.current = 0;
    setReconnectAttempt(0);
    setStatus('disconnected');
    pendingReducerCalls.current = [];
  }, []);

  const callReducer = useCallback((name: string, ...args: unknown[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ reducer: name, args }));
    } else {
      // Queue the call to be flushed on reconnect
      pendingReducerCalls.current.push({ name, args });
      setError('Action queued — reconnecting...');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intentionalCloseRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, []);

  return { status, error, reconnectAttempt, connect, disconnect, callReducer, onTableUpdate };
}
