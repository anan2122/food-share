'use client';

import { useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Package,
  Truck,
  Users,
  AlertTriangle,
  Heart,
  Clock,
  Settings,
} from 'lucide-react';
import { Card, Button, Badge, Select } from '@/components/ui';

// Mock notifications
const mockNotifications = [
  {
    id: '1',
    type: 'donation_request',
    title: 'New Food Request',
    message: 'Hope Foundation has requested 50 servings of Vegetable Biryani',
    time: '5 minutes ago',
    read: false,
    urgent: true,
    actionUrl: '/dashboard/my-donations',
  },
  {
    id: '2',
    type: 'pickup_assigned',
    title: 'Volunteer Assigned',
    message: 'Rahul Kumar has been assigned to pickup your donation',
    time: '15 minutes ago',
    read: false,
    urgent: false,
    actionUrl: '/dashboard/my-donations',
  },
  {
    id: '3',
    type: 'delivery_complete',
    title: 'Delivery Completed!',
    message: 'Your donation has been successfully delivered to Children\'s Home',
    time: '1 hour ago',
    read: false,
    urgent: false,
    actionUrl: '/dashboard/my-donations',
  },
  {
    id: '4',
    type: 'expiry_warning',
    title: 'Expiry Alert',
    message: 'Your listed Bread & Pastries will expire in 2 hours',
    time: '2 hours ago',
    read: true,
    urgent: true,
    actionUrl: '/dashboard/my-donations',
  },
  {
    id: '5',
    type: 'badge_earned',
    title: 'Badge Earned! 🏆',
    message: 'Congratulations! You\'ve earned the Silver Donor badge',
    time: '1 day ago',
    read: true,
    urgent: false,
    actionUrl: '/dashboard/impact',
  },
  {
    id: '6',
    type: 'verification',
    title: 'Account Verified',
    message: 'Your account has been verified. You can now receive food donations.',
    time: '2 days ago',
    read: true,
    urgent: false,
    actionUrl: '/dashboard',
  },
  {
    id: '7',
    type: 'new_food',
    title: 'New Food Available',
    message: '80 servings of Dal Makhani available near you (3.2 km)',
    time: '3 days ago',
    read: true,
    urgent: false,
    actionUrl: '/dashboard/available-food',
  },
];

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  donation_request: { icon: Heart, color: 'text-pink-600', bg: 'bg-pink-100' },
  pickup_assigned: { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-100' },
  delivery_complete: { icon: Check, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  expiry_warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
  badge_earned: { icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
  verification: { icon: Check, color: 'text-green-600', bg: 'bg-green-100' },
  new_food: { icon: Package, color: 'text-cyan-600', bg: 'bg-cyan-100' },
};

const filterOptions = [
  { value: '', label: 'All Notifications' },
  { value: 'unread', label: 'Unread Only' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'donation_request', label: 'Donation Requests' },
  { value: 'delivery', label: 'Deliveries' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (!filter) return true;
    if (filter === 'unread') return !n.read;
    if (filter === 'urgent') return n.urgent;
    if (filter === 'delivery') return ['pickup_assigned', 'delivery_complete'].includes(n.type);
    return n.type === filter;
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="text-gray-700" size={28} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" leftIcon={<Settings size={16} />}>
            Preferences
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" leftIcon={<CheckCheck size={16} />} onClick={markAllAsRead}>
              Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" leftIcon={<Trash2 size={16} />} onClick={clearAll}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6">
        <Filter size={20} className="text-gray-400" />
        <Select
          options={filterOptions}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="text-center py-12">
            <Bell className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No notifications</p>
            <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const config = typeConfig[notification.type] || typeConfig.donation_request;
            const Icon = config.icon;

            return (
              <Card
                key={notification.id}
                className={`relative ${!notification.read ? 'bg-blue-50/50 border-blue-200' : ''}`}
              >
                {!notification.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl" />
                )}
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                    <Icon className={config.color} size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          {notification.urgent && (
                            <Badge variant="danger" size="sm">Urgent</Badge>
                          )}
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={12} />
                            {notification.time}
                          </span>
                          {notification.actionUrl && (
                            <a 
                              href={notification.actionUrl}
                              className="text-xs text-emerald-600 hover:underline font-medium"
                            >
                              View Details →
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Notification Preferences Info */}
      <div className="mt-8 p-6 bg-gray-50 rounded-xl">
        <h3 className="font-medium text-gray-900 mb-2">Notification Preferences</h3>
        <p className="text-sm text-gray-600 mb-4">
          Customize how and when you receive notifications. You can enable push notifications, 
          email alerts, and SMS for urgent updates.
        </p>
        <Button variant="outline" size="sm" leftIcon={<Settings size={16} />}>
          Manage Preferences
        </Button>
      </div>
    </div>
  );
}
