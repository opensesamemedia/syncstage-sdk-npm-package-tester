class SyncStageDesktopAgentDelegate {
  onDesktopAgentAquired;
  onDesktopAgentReleased;
  onDesktopAgentConnected;
  onDesktopAgentDisconnected;
  onDesktopAgentDeprovisioned;
  onDesktopAgentProvisioned;

  constructor(
    onDesktopAgentAquired,
    onDesktopAgentReleased,
    onDesktopAgentConnected,
    onDesktopAgentDisconnected,
    onDesktopAgentDeprovisioned,
    onDesktopAgentProvisioned,
  ) {
    this.onDesktopAgentAquired = onDesktopAgentAquired;
    this.onDesktopAgentReleased = onDesktopAgentReleased;
    this.onDesktopAgentConnected = onDesktopAgentConnected;
    this.onDesktopAgentDisconnected = onDesktopAgentDisconnected;
    this.onDesktopAgentDeprovisioned = onDesktopAgentDeprovisioned;
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
  desktopAgentDeprovisioned() {
    this.onDesktopAgentDeprovisioned();
  }
  desktopAgentProvisioned() {
    this.onDesktopAgentProvisioned();
  }
}

export default SyncStageDesktopAgentDelegate;
