import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { FaBell, FaTimes, FaCheck, FaCheckDouble, FaTrash, FaBox, FaTruck, FaStar, FaExclamationCircle, FaShoppingBag } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../config';
import { useTheme } from '../../context/ThemeContext';

/* ── icon map ──────────────────────────────────────────────────── */
const typeIcon = {
  order_status:   { icon: FaTruck,              color: '#818cf8' },
  order_confirmed:{ icon: FaShoppingBag,        color: '#4ade80' },
  order_placed:   { icon: FaBox,                color: '#fb923c' },
  low_stock:      { icon: FaExclamationCircle,  color: '#f87171' },
  new_review:     { icon: FaStar,               color: '#fbbf24' },
};

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

/* ═══════════════════════════════════════════════════════════════ */
const NotificationBell = () => {
  const { isAuthenticated } = useSelector(s => s.auth);
  const [open, setOpen]           = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]     = useState(false);
  const ref = useRef(null);
  const { isDark } = useTheme();

  /* ── fetch ── */
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/notifications/?limit=15`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count ?? 0);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  /* poll every 30s */
  useEffect(() => {
    if (!isAuthenticated) return;
    const id = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(id);
  }, [isAuthenticated, fetchNotifications]);

  /* close on outside click */
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── mark read ── */
  const markRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/notifications/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'mark_read', notification_id: id })
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/notifications/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'mark_all_read' })
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const deleteNotif = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/notifications/?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  if (!isAuthenticated) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
        className="p-2.5 text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-orange-500 dark:hover:text-brand-orange-400 hover:bg-light-surfaceAlt/80 dark:hover:bg-dark-surfaceAlt/50 rounded-xl transition-all relative cursor-pointer"
        title="Notifications"
      >
        <FaBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[9px] font-extrabold rounded-full h-[17px] min-w-[17px] flex items-center justify-center shadow-md px-[3px]"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: .97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: .97 }}
            transition={{ duration: .18 }}
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: 370,
              maxHeight: 480,
              zIndex: 9999,
              background: 'var(--bg-surface)',
              borderRadius: 18,
              boxShadow: isDark 
                ? '0 16px 48px rgba(0,0,0,.45), 0 2px 12px rgba(0,0,0,.25)'
                : '0 16px 48px rgba(0,0,0,.1), 0 2px 8px rgba(0,0,0,.06)',
              border: '1px solid var(--border-primary)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderBottom: '1px solid var(--border-primary)',
            }}>
              <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>Notifications</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{ background: 'rgba(249,115,22,.1)', border: '1px solid rgba(249,115,22,.2)', color: 'var(--brand-primary)', fontSize: 11, fontFamily: 'sans-serif', fontWeight: 700, padding: '4px 10px', borderRadius: 8, cursor: 'pointer' }}
                    title="Mark all as read"
                  >
                    <FaCheckDouble style={{ marginRight: 4, display: 'inline-block', fontSize: 10, verticalAlign: 'middle' }} /> <span style={{ verticalAlign: 'middle' }}>Read All</span>
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
              {loading && notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: 13 }}>
                  Loading…
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                  <FaBell style={{ fontSize: 28, color: 'var(--border-primary)', margin: '0 auto 12px' }} />
                  <div style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: 14 }}>No notifications yet</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>We'll notify you when something happens!</div>
                </div>
              ) : (
                notifications.map(n => {
                  const ti = typeIcon[n.type] || { icon: FaBell, color: '#6b7280' };
                  const Icon = ti.icon;
                  return (
                    <div
                      key={n.id}
                      style={{
                        display: 'flex', gap: 12, padding: '12px 18px',
                        background: n.is_read ? 'transparent' : 'rgba(249,115,22,.04)',
                        borderLeft: n.is_read ? '3px solid transparent' : '3px solid #f97316',
                        transition: 'background .15s', cursor: 'pointer',
                      }}
                      onClick={() => !n.is_read && markRead(n.id)}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-alt)'}
                      onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(249,115,22,.04)'}
                    >
                      {/* Icon */}
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: `${ti.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon style={{ color: ti.color, fontSize: 14 }} />
                      </div>

                      {/* Body */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: n.is_read ? 600 : 700, fontSize: 13, color: 'var(--text-primary)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>
                          {n.title}
                        </div>
                        <div style={{
                          fontSize: 12, color: 'var(--text-secondary)', marginTop: 2,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                        }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>
                          {timeAgo(n.created_at)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                        {!n.is_read && (
                          <button
                            onClick={e => { e.stopPropagation(); markRead(n.id); }}
                            style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', padding: 3, fontSize: 12 }}
                            title="Mark read"
                          ><FaCheck /></button>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 3, fontSize: 11 }}
                          title="Delete"
                        ><FaTrash /></button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
