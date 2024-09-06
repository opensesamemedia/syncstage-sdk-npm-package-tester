class SyncStageDesktopAgentDelegate {
  onDesktopAgentAquired;
  onDesktopAgentReleased;
  onDesktopAgentConnected;
  onDesktopAgentDisconnected;
  onDesktopAgentDeprovisioned;
  onDesktopAgentProvisioned;
  onBrowserConnected;
  onBrowserDisconnected;

  constructor(
    onDesktopAgentAquired,
    onDesktopAgentReleased,
    onDesktopAgentConnected,
    onDesktopAgentDisconnected,
    onDesktopAgentDeprovisioned,
    onDesktopAgentProvisioned,
    onBrowserConnected,
    onBrowserDisconnected,
  ) {
    this.onDesktopAgentAquired = onDesktopAgentAquired;
    this.onDesktopAgentReleased = onDesktopAgentReleased;
    this.onDesktopAgentConnected = onDesktopAgentConnected;
    this.onDesktopAgentDisconnected = onDesktopAgentDisconnected;
    this.onDesktopAgentDeprovisioned = onDesktopAgentDeprovisioned;
    this.onDesktopAgentProvisioned = onDesktopAgentProvisioned;
    this.onBrowserConnected = onBrowserConnected;
    this.onBrowserDisconnected = onBrowserDisconnected;
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
  browserConnected() {
    this.onBrowserConnected();
  }

  browserDisconnected() {
    this.onBrowserDisconnected();
  }
}

export default SyncStageDesktopAgentDelegate;
