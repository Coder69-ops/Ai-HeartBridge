import { User } from '../models/User';
import { JournalSession, JournalSessionStatus } from '../models/JournalSession';
import { Couple } from '../models/Couple';

export interface NotificationTemplate {
  title: string;
  body: string;
  actionText: string;
  priority: 'high' | 'normal' | 'low';
  icon?: string;
}

export interface PushNotificationData {
  type: string;
  sessionId?: string;
  action?: string;
  [key: string]: any;
}

export class JournalNotificationService {
  private static instance: JournalNotificationService;
  
  private readonly NOTIFICATION_TEMPLATES = {
    PARTNER_COMPLETED_REFLECTION: {
      title: "📔 Your partner has shared their reflection",
      body: "{{partnerName}} has completed their journal entry. Would you like to share your perspective as well?",
      actionText: "View Journal",
      priority: "high" as const,
      icon: "📔"
    },
    
    INSIGHTS_READY: {
      title: "✨ Your relationship insights are ready",
      body: "Both reflections have been analyzed. Discover your shared insights and growth opportunities.",
      actionText: "View Insights",
      priority: "high" as const,
      icon: "✨"
    },
    
    GENTLE_REMINDER: {
      title: "💙 A gentle reminder",
      body: "{{partnerName}} shared their thoughts {{timeAgo}}. Take your time when you're ready to reflect.",
      actionText: "View Journal",
      priority: "normal" as const,
      icon: "💙"
    },
    
    JOURNAL_INVITATION: {
      title: "📝 New journal session created",
      body: "{{partnerName}} has started a new reflection session. Join when you're ready.",
      actionText: "Join Session",
      priority: "normal" as const,
      icon: "📝"
    }
  };

  public static getInstance(): JournalNotificationService {
    if (!JournalNotificationService.instance) {
      JournalNotificationService.instance = new JournalNotificationService();
    }
    return JournalNotificationService.instance;
  }

  /**
   * Notify partner when their partner completes a reflection
   */
  async notifyPartnerReflectionComplete(
    sessionId: string, 
    completedByUserId: string, 
    partnerId: string
  ): Promise<void> {
    try {
      const [session, completedBy, partner] = await Promise.all([
        JournalSession.findById(sessionId),
        User.findById(completedByUserId),
        User.findById(partnerId)
      ]);

      if (!session || !completedBy || !partner) {
        console.error('Missing data for notification:', { sessionId, completedByUserId, partnerId });
        return;
      }

      const partnerName = this.getDisplayName(completedBy);
      const template = this.NOTIFICATION_TEMPLATES.PARTNER_COMPLETED_REFLECTION;
      
      const notificationData: PushNotificationData = {
        type: 'journal_partner_complete',
        sessionId,
        action: 'view_journal'
      };

      // Send push notification
      await this.sendPushNotification(partner, {
        title: template.title,
        body: template.body.replace('{{partnerName}}', partnerName),
        data: notificationData,
        icon: template.icon,
        badge: '/icons/heart-bridge-96.png',
        tag: `journal-${sessionId}`,
        requireInteraction: true
      });

      // Create in-app notification
      await this.createInAppNotification(partnerId, {
        type: 'journal_partner_complete',
        title: 'Partner Reflection Complete',
        message: `${partnerName} has shared their thoughts. Your turn to reflect when you're ready.`,
        sessionId,
        isRead: false,
        priority: template.priority
      });

      // Update session notification status
      await JournalSession.findByIdAndUpdate(sessionId, {
        'notificationSent.partner1Complete': true
      });

      console.log(`Notification sent to ${partner.email} for journal session ${sessionId}`);
    } catch (error) {
      console.error('Error sending partner reflection notification:', error);
    }
  }

  /**
   * Notify both partners when insights are ready
   */
  async notifyInsightsReady(sessionId: string): Promise<void> {
    try {
      const session = await JournalSession.findById(sessionId).populate('coupleId');
      if (!session) return;

      const couple = await Couple.findById(session.coupleId);
      if (!couple) return;

      const [partner1, partner2] = await Promise.all([
        User.findById(couple.partner1Id),
        User.findById(couple.partner2Id)
      ]);

      const template = this.NOTIFICATION_TEMPLATES.INSIGHTS_READY;
      const notificationData: PushNotificationData = {
        type: 'journal_insights_ready',
        sessionId,
        action: 'view_insights'
      };

      // Send to both partners
      const notifications = [];
      if (partner1) {
        notifications.push(
          this.sendPushNotification(partner1, {
            title: template.title,
            body: template.body,
            data: notificationData,
            icon: template.icon,
            badge: '/icons/heart-bridge-96.png',
            tag: `insights-${sessionId}`,
            requireInteraction: true
          }),
          this.createInAppNotification(partner1._id.toString(), {
            type: 'journal_insights_ready',
            title: 'Relationship Insights Ready',
            message: 'Your shared insights and growth opportunities are ready to explore.',
            sessionId,
            isRead: false,
            priority: template.priority
          })
        );
      }

      if (partner2) {
        notifications.push(
          this.sendPushNotification(partner2, {
            title: template.title,
            body: template.body,
            data: notificationData,
            icon: template.icon,
            badge: '/icons/heart-bridge-96.png',
            tag: `insights-${sessionId}`,
            requireInteraction: true
          }),
          this.createInAppNotification(partner2._id.toString(), {
            type: 'journal_insights_ready',
            title: 'Relationship Insights Ready',
            message: 'Your shared insights and growth opportunities are ready to explore.',
            sessionId,
            isRead: false,
            priority: template.priority
          })
        );
      }

      await Promise.all(notifications);

      // Update session notification status
      await JournalSession.findByIdAndUpdate(sessionId, {
        'notificationSent.insightsReady': true
      });

      console.log(`Insights notifications sent for journal session ${sessionId}`);
    } catch (error) {
      console.error('Error sending insights notification:', error);
    }
  }

  /**
   * Send gentle reminder to partner who hasn't completed their reflection
   */
  async sendGentleReminder(sessionId: string, partnerId: string): Promise<void> {
    try {
      const [session, partner, couple] = await Promise.all([
        JournalSession.findById(sessionId),
        User.findById(partnerId),
        JournalSession.findById(sessionId).then(s => s ? Couple.findById(s.coupleId) : null)
      ]);

      if (!session || !partner || !couple) return;

      // Find the other partner
      const otherPartnerId = couple.partner1Id.equals(partnerId) ? couple.partner2Id : couple.partner1Id;
      const otherPartner = await User.findById(otherPartnerId);
      
      if (!otherPartner) return;

      const partnerName = this.getDisplayName(otherPartner);
      const timeAgo = this.getTimeAgo(session.partner1CompletedAt || session.partner2CompletedAt);
      const template = this.NOTIFICATION_TEMPLATES.GENTLE_REMINDER;

      await this.sendPushNotification(partner, {
        title: template.title,
        body: template.body
          .replace('{{partnerName}}', partnerName)
          .replace('{{timeAgo}}', timeAgo),
        data: {
          type: 'journal_reminder',
          sessionId,
          action: 'view_journal'
        },
        icon: template.icon,
        badge: '/icons/heart-bridge-96.png',
        tag: `reminder-${sessionId}`
      });

      console.log(`Gentle reminder sent to ${partner.email} for journal session ${sessionId}`);
    } catch (error) {
      console.error('Error sending gentle reminder:', error);
    }
  }

  /**
   * Send push notification using Web Push API
   */
  private async sendPushNotification(
    user: any, 
    options: {
      title: string;
      body: string;
      data?: PushNotificationData;
      icon?: string;
      badge?: string;
      tag?: string;
      requireInteraction?: boolean;
    }
  ): Promise<void> {
    // This would integrate with your existing push notification system
    // For now, we'll log the notification
    console.log(`Push notification for ${user.email}:`, {
      title: options.title,
      body: options.body,
      data: options.data
    });

    // TODO: Integrate with actual push notification service
    // await pushService.send(user.pushSubscription, options);
  }

  /**
   * Create in-app notification (stored in database)
   */
  private async createInAppNotification(
    userId: string,
    notification: {
      type: string;
      title: string;
      message: string;
      sessionId?: string;
      isRead: boolean;
      priority: 'high' | 'normal' | 'low';
    }
  ): Promise<void> {
    // This would store the notification in a notifications collection
    // For now, we'll log it
    console.log(`In-app notification for user ${userId}:`, notification);

    // TODO: Store in notifications collection
    // await Notification.create({
    //   userId,
    //   ...notification,
    //   createdAt: new Date()
    // });
  }

  /**
   * Get display name for user
   */
  private getDisplayName(user: any): string {
    if (user.profile?.firstName) {
      return user.profile.firstName + (user.profile.lastName ? ` ${user.profile.lastName[0]}.` : '');
    }
    return user.name || user.email.split('@')[0];
  }

  /**
   * Get human-readable time ago string
   */
  private getTimeAgo(date: Date | undefined): string {
    if (!date) return 'recently';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return 'recently';
  }
}

export const journalNotificationService = JournalNotificationService.getInstance();
