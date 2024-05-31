class SyncStageDesktopAgentDelegate {
  onDesktopAgentAquired;
  onDesktopAgentReleased;
  onDesktopAgentConnected;
  onDesktopAgentDisconnected;
  onDesktopAgentRelaunched;

  constructor(
    onDesktopAgentAquired,
    onDesktopAgentReleased,
    onDesktopAgentConnected,
    onDesktopAgentDisconnected,
    onDesktopAgentRelaunched,
  ) {
    this.onDesktopAgentAquired = onDesktopAgentAquired;
    this.onDesktopAgentReleased = onDesktopAgentReleased;
    this.onDesktopAgentConnected = onDesktopAgentConnected;
    this.onDesktopAgentDisconnected = onDesktopAgentDisconnected;
    this.onDesktopAgentRelaunched = onDesktopAgentRelaunched;
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
  desktopAgentRelaunched() {
    this.onDesktopAgentRelaunched();
  }
}

export default SyncStageDesktopAgentDelegate;
