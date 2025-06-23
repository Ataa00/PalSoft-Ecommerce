"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaBell, 
  FaCheck, 
  FaTrash, 

  FaArrowLeft,
  FaCog,
  FaCheckDouble
} from 'react-icons/fa';
import NotificationService, { Notification, NotificationPreferences } from '@/services/notification.service';
import AuthGuard from '@/components/checkout/AuthGuard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function NotificationsPageContent() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | Notification['type']>('all');
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    NotificationService.getNotificationPreferences()
  );

  useEffect(() => {
    // Load notifications
    setNotifications(NotificationService.getNotifications());
    setIsLoading(false);

    // Subscribe to updates
    const unsubscribe = NotificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...notifications];

    if (selectedFilter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (selectedFilter !== 'all') {
      filtered = filtered.filter(n => n.type === selectedFilter);
    }

    setFilteredNotifications(filtered);
  }, [notifications, selectedFilter]);

  const handleMarkAsRead = (notificationId: string) => {
    NotificationService.markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    NotificationService.markAllAsRead();
  };

  const handleDeleteNotification = (notificationId: string) => {
    NotificationService.deleteNotification(notificationId);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      NotificationService.clearAllNotifications();
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    const updatedPreferences = { ...preferences, [key]: value };
    setPreferences(updatedPreferences);
    NotificationService.updateNotificationPreferences(updatedPreferences);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order_update':
        return '📦';
      case 'stock_alert':
        return '⚠️';
      case 'user_activity':
        return '👤';
      case 'promotion':
        return '🎉';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getFilterCounts = () => {
    return {
      all: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      order_update: notifications.filter(n => n.type === 'order_update').length,
      stock_alert: notifications.filter(n => n.type === 'stock_alert').length,
      user_activity: notifications.filter(n => n.type === 'user_activity').length,
      promotion: notifications.filter(n => n.type === 'promotion').length,
      system: notifications.filter(n => n.type === 'system').length
    };
  };

  const filterCounts = getFilterCounts();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <LoadingSpinner size="lg" text="Loading notifications..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft className="text-sm" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">Stay updated with your account activity</p>
            </div>
            
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="flex items-center space-x-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <FaCog className="text-sm" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        {showPreferences && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={preferences.orderUpdates}
                  onChange={(e) => handlePreferenceChange('orderUpdates', e.target.checked)}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span>Order Updates</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={preferences.stockAlerts}
                  onChange={(e) => handlePreferenceChange('stockAlerts', e.target.checked)}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span>Stock Alerts</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={preferences.promotions}
                  onChange={(e) => handlePreferenceChange('promotions', e.target.checked)}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span>Promotions</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={preferences.systemNotifications}
                  onChange={(e) => handlePreferenceChange('systemNotifications', e.target.checked)}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span>System Notifications</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span>Email Notifications</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications}
                  onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span>Push Notifications</span>
              </label>
            </div>
          </div>
        )}

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All ({filterCounts.all})
              </button>
              
              <button
                onClick={() => setSelectedFilter('unread')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === 'unread'
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Unread ({filterCounts.unread})
              </button>
              
              <button
                onClick={() => setSelectedFilter('order_update')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === 'order_update'
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Orders ({filterCounts.order_update})
              </button>
              
              <button
                onClick={() => setSelectedFilter('promotion')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === 'promotion'
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Promotions ({filterCounts.promotion})
              </button>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={handleMarkAllAsRead}
                disabled={filterCounts.unread === 0}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                <FaCheckDouble className="text-xs" />
                <span>Mark All Read</span>
              </button>
              
              <button
                onClick={handleClearAll}
                disabled={notifications.length === 0}
                className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                <FaTrash className="text-xs" />
                <span>Clear All</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FaBell className="text-4xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {selectedFilter === 'all' 
                  ? "You don't have any notifications yet."
                  : `No ${selectedFilter === 'unread' ? 'unread' : selectedFilter.replace('_', ' ')} notifications.`
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-md border-l-4 ${getPriorityColor(notification.priority)} ${
                  !notification.read ? 'ring-2 ring-blue-100' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <span className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className={`text-lg font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Mark as read"
                              >
                                <FaCheck />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete notification"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mt-2">{notification.message}</p>
                        
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-sm text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          
                          {notification.actionUrl && notification.actionText && (
                            <Link
                              href={notification.actionUrl}
                              onClick={() => {
                                if (!notification.read) {
                                  NotificationService.markAsRead(notification.id);
                                }
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {notification.actionText}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <NotificationsPageContent />
    </AuthGuard>
  );
}
