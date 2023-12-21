class SyncStageDesktopAgentDelegate {
  onDesktopAgentAquired;
  onDesktopAgentReleased;
  onDesktopAgentConnected;
  onDesktopAgentDisconnected;

  constructor(onDesktopAgentAquired, onDesktopAgentReleased, desktopAgentConnected, desktopAgentDisconnected) {
    this.onDesktopAgentAquired = onDesktopAgentAquired;
    this.onDesktopAgentReleased = onDesktopAgentReleased;
    this.onDesktopAgentConnected = desktopAgentConnected;
    this.onDesktopAgentDisconnected = desktopAgentDisconnected;
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
