import { io, Socket } from 'socket.io-client';

const URL = process.env.NODE_ENV === 'production' 
  ? 'https://captivating-optimism-production-fee7.up.railway.app' 
  : 'http://localhost:3001';

class SocketService {
  private socket: Socket;
  private userId: string | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private onlineStatusCallbacks: ((isOnline: boolean) => void)[] = [];
  private partnerStatusCallbacks: ((partnerId: string, isOnline: boolean) => void)[] = [];

  constructor() {
    this.socket = io(URL, {
      autoConnect: false,
      transports: ['websocket', 'polling']
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      if (this.userId) {
        this.socket.emit('user_online', this.userId);
        this.startHeartbeat();
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.stopHeartbeat();
    });

    this.socket.on('partner_status_changed', ({ userId, isOnline }) => {
      console.log(`Partner ${userId} is now ${isOnline ? 'online' : 'offline'}`);
      this.partnerStatusCallbacks.forEach(callback => {
        callback(userId, isOnline);
      });
    });
  }

  connect(userId: string) {
    this.userId = userId;
    if (!this.socket.connected) {
      this.socket.connect();
    } else {
      this.socket.emit('user_online', userId);
      this.startHeartbeat();
    }
  }

  disconnect() {
    this.stopHeartbeat();
    this.socket.disconnect();
    this.userId = null;
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.userId && this.socket.connected) {
        this.socket.emit('heartbeat', this.userId);
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  checkPartnerStatus(partnerId: string): Promise<{ isOnline: boolean; lastSeen?: Date }> {
    return new Promise((resolve) => {
      this.socket.emit('check_partner_status', partnerId, (response: any) => {
        resolve(response);
      });
    });
  }

  onPartnerStatusChange(callback: (partnerId: string, isOnline: boolean) => void) {
    this.partnerStatusCallbacks.push(callback);
    return () => {
      const index = this.partnerStatusCallbacks.indexOf(callback);
      if (index > -1) {
        this.partnerStatusCallbacks.splice(index, 1);
      }
    };
  }

  // Legacy socket export for backward compatibility
  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
export const socket = socketService.getSocket(); // For backward compatibility
