/**
 * Notification Service
 * Handles real-time notifications for order updates, stock alerts, and user activities
 */

export interface Notification {
  id: string;
  type: 'order_update' | 'stock_alert' | 'user_activity' | 'system' | 'promotion';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  userId?: number;
  orderId?: number;
  productId?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  stockAlerts: boolean;
  promotions: boolean;
  systemNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];
  private listeners: Array<(notifications: Notification[]) => void> = [];
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  private constructor() {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.loadNotificationsFromStorage();
      this.initializeWebSocket();
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize WebSocket connection for real-time notifications
   */
  private initializeWebSocket() {
    try {
      // In production, this would connect to your WebSocket server
      // For demo, we'll simulate with periodic updates
      this.simulateRealTimeNotifications();
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Simulate real-time notifications for demo purposes
   */
  private simulateRealTimeNotifications() {
    // Simulate receiving notifications every 30 seconds
    setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance of receiving a notification
        this.generateMockNotification();
      }
    }, 30000);

    // Generate initial notifications
    this.generateInitialNotifications();
  }

  /**
   * Generate mock notifications for demo
   */
  private generateMockNotification() {
    const types: Notification['type'][] = ['order_update', 'stock_alert', 'user_activity', 'promotion'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const mockNotifications: Record<Notification['type'], Partial<Notification>> = {
      order_update: {
        title: 'Order Status Updated',
        message: `Your order #${1000 + Math.floor(Math.random() * 999)} has been shipped!`,
        priority: 'medium',
        actionUrl: '/orders',
        actionText: 'View Order'
      },
      stock_alert: {
        title: 'Low Stock Alert',
        message: 'Premium Cotton T-Shirt is running low on stock (5 remaining)',
        priority: 'high',
        actionUrl: '/admin/products',
        actionText: 'Manage Stock'
      },
      user_activity: {
        title: 'New Review',
        message: 'You received a new 5-star review on your recent purchase',
        priority: 'low',
        actionUrl: '/profile',
        actionText: 'View Reviews'
      },
      promotion: {
        title: 'Special Offer',
        message: '20% off on all electronics! Limited time offer.',
        priority: 'medium',
        actionUrl: '/products?category=electronics',
        actionText: 'Shop Now'
      },
      system: {
        title: 'System Update',
        message: 'New features have been added to improve your shopping experience',
        priority: 'low'
      }
    };

    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      userId: 1, // Current user ID
      ...mockNotifications[type]
    } as Notification;

    this.addNotification(notification);
  }

  /**
   * Generate initial notifications for demo
   */
  private generateInitialNotifications() {
    const initialNotifications: Notification[] = [
      {
        id: 'notif_1',
        type: 'order_update',
        title: 'Order Delivered',
        message: 'Your order #1001 has been delivered successfully!',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        userId: 1,
        orderId: 1001,
        priority: 'high',
        actionUrl: '/orders/1001',
        actionText: 'View Order'
      },
      {
        id: 'notif_2',
        type: 'promotion',
        title: 'Welcome Offer',
        message: 'Get 15% off on your first purchase with code WELCOME15',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        userId: 1,
        priority: 'medium',
        actionUrl: '/products',
        actionText: 'Shop Now'
      }
    ];

    initialNotifications.forEach(notification => {
      this.addNotification(notification, false);
    });
  }

  /**
   * Add a new notification
   */
  public addNotification(notification: Notification, notify: boolean = true) {
    this.notifications.unshift(notification);
    this.saveNotificationsToStorage();
    
    if (notify) {
      this.notifyListeners();
      this.showBrowserNotification(notification);
    }
  }

  /**
   * Get all notifications
   */
  public getNotifications(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Get unread notifications count
   */
  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  /**
   * Mark notification as read
   */
  public markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotificationsToStorage();
      this.notifyListeners();
    }
  }

  /**
   * Mark all notifications as read
   */
  public markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotificationsToStorage();
    this.notifyListeners();
  }

  /**
   * Delete a notification
   */
  public deleteNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotificationsToStorage();
    this.notifyListeners();
  }

  /**
   * Clear all notifications
   */
  public clearAllNotifications() {
    this.notifications = [];
    this.saveNotificationsToStorage();
    this.notifyListeners();
  }

  /**
   * Subscribe to notification updates
   */
  public subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(notification: Notification) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  }

  /**
   * Request notification permission
   */
  public async requestNotificationPermission(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  /**
   * Notify all listeners
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  /**
   * Save notifications to localStorage
   */
  private saveNotificationsToStorage() {
    // Only access localStorage in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to save notifications to storage:', error);
    }
  }

  /**
   * Load notifications from localStorage
   */
  private loadNotificationsFromStorage() {
    // Only access localStorage in browser environment
    if (typeof window === 'undefined') {
      this.notifications = [];
      return;
    }

    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load notifications from storage:', error);
      this.notifications = [];
    }
  }

  /**
   * Schedule WebSocket reconnection
   */
  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.initializeWebSocket();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    }
  }

  /**
   * Get notification preferences
   */
  public getNotificationPreferences(): NotificationPreferences {
    // Only access localStorage in browser environment
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('notificationPreferences');
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
      }
    }

    // Default preferences
    return {
      orderUpdates: true,
      stockAlerts: true,
      promotions: true,
      systemNotifications: true,
      emailNotifications: false,
      pushNotifications: false
    };
  }

  /**
   * Update notification preferences
   */
  public updateNotificationPreferences(preferences: NotificationPreferences) {
    // Only access localStorage in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }
}

export default NotificationService.getInstance();
