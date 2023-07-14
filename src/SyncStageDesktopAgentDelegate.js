class SyncStageDesktopAgentDelegate {
  onDesktopAgentAquired;
  onDesktopAgentReleased;

  constructor(onDesktopAgentAquired, onDesktopAgentReleased) {
    this.onDesktopAgentAquired = onDesktopAgentAquired;
    this.onDesktopAgentReleased = onDesktopAgentReleased;
  }

  desktopAgentAquired() {
    this.onDesktopAgentAquired;
  }
  desktopAgentReleased() {
    this.onDesktopAgentReleased;
  }
}

export default SyncStageDesktopAgentDelegate;
