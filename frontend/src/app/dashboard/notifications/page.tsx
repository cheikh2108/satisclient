'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabPanel } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toast';
import { Bell, CheckCheck, Trash2, MessageSquare, AlertCircle, QrCode, Users, Clock } from 'lucide-react';
import { SkeletonTable } from '@/components/ui/skeleton';
import {
  useNotifications,
  useNotificationStats,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from '@/hooks';
import type { Notification } from '@/types/api';

const StatCard = ({ label, value, change, isPositive = true }: { label: string; value: string; change: string; isPositive?: boolean }) => (
  <div className="rounded-xl bg-slate-50/50 dark:bg-[#0a0a0a]/50 border border-slate-200/50 dark:border-slate-800/50 p-6">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
          {label}
        </p>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
      <span className={`text-sm font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {change}
      </span>
    </div>
  </div>
);

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const { addToast } = useToast();

  const { data: notificationsData, isLoading, error } = useNotifications();
  const { data: stats } = useNotificationStats();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotif = useDeleteNotification();

  const notifications: Notification[] = notificationsData?.data || [];

  const getNotificationIcon = (notificationType: string) => {
    const t = (notificationType || '').toLowerCase();
    if (t === 'feedback') return <MessageSquare className="h-5 w-5 text-primary-600 dark:text-primary-400" />;
    if (t === 'complaint' || t === 'reclamation') return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
    if (t === 'qr_scan' || t === 'qr') return <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    if (t === 'user') return <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
    return <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />;
  };

  const markAsRead = (id: string) => {
    markRead.mutate(id);
    addToast({ type: 'success', title: 'Notification marquée comme lue' });
  };

  const markAllAsRead = () => {
    markAllRead.mutate();
  };

  const deleteNotification = (id: string) => {
    deleteNotif.mutate(id);
    addToast({ type: 'success', title: 'Notification supprimée' });
  };

  const deleteAll = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
      notifications.forEach((n) => deleteNotif.mutate(n.id));
      addToast({ type: 'success', title: 'Toutes les notifications ont été supprimées' });
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return n.readAt === null;
    if (activeTab === 'read') return n.readAt !== null;
    return true;
  });

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${diffDays}j`;
  };

  const tabs = [
    { id: 'all', label: 'Toutes', badge: notifications.length },
    { id: 'unread', label: 'Non lues', badge: notifications.filter((n) => n.readAt === null).length },
    { id: 'read', label: 'Lues', badge: notifications.filter((n) => n.readAt !== null).length },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-slate-900 dark:text-white leading-tight">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Restez informé de toute l'activité
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={markAllAsRead}
            disabled={notifications.every((n) => n.readAt !== null) || markAllRead.isPending}
            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#222222] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCheck className="h-4 w-4" />
            <span className="hidden xs:inline">Tout marquer comme lu</span>
          </button>
          <button
            onClick={deleteAll}
            disabled={notifications.length === 0}
            className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800/60 bg-white dark:bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden xs:inline">Tout supprimer</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Notifications" value={(stats?.total ?? notifications.length).toString()} change={(stats?.total ?? 0) > 0 ? `${Math.round(((stats?.unread??0)/((stats?.total??1)))*100)}% non lues` : '—'} isPositive={(stats?.unread ?? 0) === 0} />
        <StatCard label="Non lues" value={(stats?.unread ?? 0).toString()} change={(stats?.total ?? 0) > 0 ? `${Math.round(((stats?.unread ?? 0) / (stats?.total ?? 1)) * 100)}% du total` : '—'} isPositive={(stats?.unread ?? 0) === 0} />
        <StatCard label="Aujourd'hui" value={notifications.filter((n: any) => { const d = new Date(n.createdAt); const now = new Date(); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate(); }).length.toString()} change="—" isPositive />
      </div>

      {/* Loading / Error / Tabs + Notifications */}
      {isLoading ? (
        <SkeletonTable />
      ) : error ? (
        <div className="rounded-xl border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-900/10 p-6 text-center text-sm text-red-600 dark:text-red-400">
          Impossible de charger les notifications. Veuillez réessayer.
        </div>
      ) : (
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} variant="pills">
          <TabPanel tabId={activeTab}>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#111111] overflow-hidden">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-[#1a1a1a] flex items-center justify-center mb-4">
                    <Bell className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                    Aucune notification
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Vous êtes à jour !
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-800/40">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-slate-50 dark:hover:bg-[#0f0f0f] transition-colors ${
                        notification.readAt === null ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-[#1a1a1a] flex items-center justify-center">
                            {getNotificationIcon(notification.notificationType)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-1">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                              {notification.subject}
                              {notification.readAt === null && (
                                <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary-600"></span>
                              )}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                              <Clock className="h-3 w-3" />
                              {getRelativeTime(notification.createdAt)}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            {notification.body}
                          </p>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {notification.readAt === null && (
                              <>
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                >
                                  Marquer comme lu
                                </button>
                                <span className="text-slate-300 dark:text-slate-700">•</span>
                              </>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabPanel>
        </Tabs>
      )}
    </div>
  );
}
