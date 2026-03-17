export class LogWebSocket {
  private socket: WebSocket | null = null;
  private onMessage: (msg: any) => void;

  constructor(onMessage: (msg: any) => void) {
    this.onMessage = onMessage;
  }

  connect(projectId: string) {
    const wsUrl = `ws://localhost:7860/ws/${projectId}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessage(data);
      } catch (e) {
        console.error('Error parsing WS message:', e);
      }
    };

    this.socket.onclose = () => {
      console.log('WS closed. Reconnecting in 3s...');
      setTimeout(() => this.connect(projectId), 3000);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
    }
  }
}
