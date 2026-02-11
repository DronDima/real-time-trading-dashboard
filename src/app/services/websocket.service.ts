import { inject, Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { SocketEvent } from '../models/socket-event';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private hubConnection?: HubConnection;
  private readonly events$ = new Subject<SocketEvent>();
  private readonly status$ = new Subject<HubConnectionState>();
  private readonly reconnected$ = new Subject<void>();
  private readonly apiUrl = 'http://localhost:5160/offersHub';
  private reconnectAttempts = 0;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private readonly maxReconnectAttempts = 10;
  private readonly baseDelayMs = 1000;
  private readonly maxDelayMs = 30000;
  private shouldReconnect = true;

  get events(): Observable<SocketEvent> {
    return this.events$.asObservable();
  }

  get status(): Observable<HubConnectionState> {
    return this.status$.asObservable();
  }

  get reconnected(): Observable<void> {
    return this.reconnected$.asObservable();
  }

  get currentStatus(): HubConnectionState {
    if (!this.hubConnection) {
      return HubConnectionState.Disconnected;
    }
    return this.hubConnection.state;
  }

  private updateStatus(status: HubConnectionState): void {
    this.status$.next(status);
  }

  private calculateDelay(attempt: number): number {
    const delay = Math.min(
      this.baseDelayMs * Math.pow(2, attempt),
      this.maxDelayMs
    );
    return delay;
  }

  private async attemptReconnect(): Promise<void> {
    if (!this.shouldReconnect || this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Max reconnection attempts reached or reconnection disabled');
      return;
    }

    const delay = this.calculateDelay(this.reconnectAttempts);
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectAttempts++;
      try {
        await this.start(true);
        this.reconnectAttempts = 0;
      } catch (error) {
        console.error('Reconnection attempt failed:', error);
        if (this.shouldReconnect) {
          this.attemptReconnect();
        }
      }
    }, delay);
  }

  private cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
    this.reconnectAttempts = 0;
  }

  async start(isReconnectAttempt = false): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected 
      || this.hubConnection?.state === HubConnectionState.Connecting) {
      return;
    }

    this.shouldReconnect = true;
    
    if (!isReconnectAttempt) {
      this.cancelReconnect();
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.apiUrl)
      .build();

    this.hubConnection.on('OfferEvent', (data: string) => {
      try {
        const event = JSON.parse(data) as SocketEvent;
        this.events$.next(event);
      } catch (error) {
        console.error('Error parsing WebSocket event:', error);
      }
    });

    this.hubConnection.onclose(() => {
      this.updateStatus(HubConnectionState.Disconnected);
      if (this.shouldReconnect) {
        this.attemptReconnect();
      }
    });

    this.hubConnection.onreconnecting(() => {
      this.updateStatus(HubConnectionState.Reconnecting);
    });

    this.hubConnection.onreconnected(() => {
      this.updateStatus(HubConnectionState.Connected);
      this.reconnectAttempts = 0;
      this.reconnected$.next();
    });

    try {
      this.updateStatus(HubConnectionState.Connecting);
      await this.hubConnection.start();
      this.updateStatus(HubConnectionState.Connected);
      this.reconnectAttempts = 0;
      console.log('WebSocket connection established');
      if (isReconnectAttempt) {
        this.reconnected$.next();
      }
    } catch (error) {
      this.updateStatus(HubConnectionState.Disconnected);
      console.error('Error starting WebSocket connection:', error);
      if (isReconnectAttempt) {
        throw error;
      }
    }
  }

  async stop(): Promise<void> {
    this.shouldReconnect = false;
    this.cancelReconnect();
    if (this.hubConnection) {
      this.updateStatus(HubConnectionState.Disconnecting);
      await this.hubConnection.stop();
      this.hubConnection = undefined;
      this.updateStatus(HubConnectionState.Disconnected);
    }
  }
}
