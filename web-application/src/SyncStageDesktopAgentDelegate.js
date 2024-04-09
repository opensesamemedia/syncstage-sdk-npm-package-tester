class SyncStageDesktopAgentDelegate {
  onDesktopAgentAquired;
  onDesktopAgentReleased;
  onDesktopAgentConnected;
  onDesktopAgentDisconnected;

  constructor(onDesktopAgentAquired, onDesktopAgentReleased, onDesktopAgentConnected, onDesktopAgentDisconnected) {
    this.onDesktopAgentAquired = onDesktopAgentAquired;
    this.onDesktopAgentReleased = onDesktopAgentReleased;
    this.onDesktopAgentConnected = onDesktopAgentConnected;
    this.onDesktopAgentDisconnected = onDesktopAgentDisconnected;
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
}

export default SyncStageDesktopAgentDelegate;
