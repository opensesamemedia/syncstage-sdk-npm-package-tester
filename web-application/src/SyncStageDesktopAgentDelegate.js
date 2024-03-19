class SyncStageDesktopAgentDelegate {
  onDesktopAgentAquired;
  onDesktopAgentReleased;
  onDesktopAgentConnected;
  onDesktopAgentDisconnected;
  onDesktopAgentConnectionKeepAlive;
  onDesktopAgentAquiredesktopAgentLostConnection;

  constructor(
    onDesktopAgentAquired,
    onDesktopAgentReleased,
    onDesktopAgentConnected,
    onDesktopAgentDisconnected,
    onDesktopAgentConnectionKeepAlive,
    onDesktopAgentLostConnection,
  ) {
    this.onDesktopAgentAquired = onDesktopAgentAquired;
    this.onDesktopAgentReleased = onDesktopAgentReleased;
    this.onDesktopAgentConnected = onDesktopAgentConnected;
    this.onDesktopAgentDisconnected = onDesktopAgentDisconnected;
    this.onDesktopAgentConnectionKeepAlive = onDesktopAgentConnectionKeepAlive;
    this.onDesktopAgentLostConnection = onDesktopAgentLostConnection;
  }

  desktopAgentAquired() {
    this.onDesktopAgentAquired();
  }
  desktopAgentReleased() {
    this.onDesktopAgentReleased();
  }
  desktopAgentConnected() {
    this.onDesktopAgentConnected();
  }
  desktopAgentDisconnected() {
    this.onDesktopAgentDisconnected();
  }
  desktopAgentLostConnection() {
    this.onDesktopAgentLostConnection();
  }
  desktopAgentConnectionKeepAlive() {
    this.onDesktopAgentConnectionKeepAlive();
  }
}

export default SyncStageDesktopAgentDelegate;
