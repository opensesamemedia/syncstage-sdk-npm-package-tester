class SyncStageDesktopAgentDelegate {
  onDesktopAgentAquired;
  onDesktopAgentReleased;
  onDesktopAgentConnected;
  onDesktopAgentDisconnected;
  onDesktopAgentRelaunched;
  onDesktopAgentProvisioned;

  constructor(
    onDesktopAgentAquired,
    onDesktopAgentReleased,
    onDesktopAgentConnected,
    onDesktopAgentDisconnected,
    onDesktopAgentRelaunched,
    onDesktopAgentProvisioned,
  ) {
    this.onDesktopAgentAquired = onDesktopAgentAquired;
    this.onDesktopAgentReleased = onDesktopAgentReleased;
    this.onDesktopAgentConnected = onDesktopAgentConnected;
    this.onDesktopAgentDisconnected = onDesktopAgentDisconnected;
    this.onDesktopAgentRelaunched = onDesktopAgentRelaunched;
    this.onDesktopAgentProvisioned = onDesktopAgentProvisioned;
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
  desktopAgentProvisioned() {
    this.onDesktopAgentProvisioned();
  }
}

export default SyncStageDesktopAgentDelegate;
