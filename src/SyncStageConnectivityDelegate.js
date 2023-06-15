class SyncStageConnectivityDelegate {
  onTransmitterConnectivityChanged;
  onReceiverConnectivityChanged;
  onDesktopAgentReconnected;

  constructor(onTransmitterConnectivityChanged, onReceiverConnectivityChanged, onDesktopAgentReconnected) {
    this.onTransmitterConnectivityChanged = onTransmitterConnectivityChanged;
    this.onReceiverConnectivityChanged = onReceiverConnectivityChanged;
    this.onDesktopAgentReconnected = onDesktopAgentReconnected;
  }

  transmitterConnectivityChanged(connected) {
    this.onTransmitterConnectivityChanged(connected);
  }
  receiverConnectivityChanged(identifier, connected) {
    this.onReceiverConnectivityChanged(identifier, connected);
  }

  desktopAgentReconnected() {
    this.onDesktopAgentReconnected();
  }
}

export default SyncStageConnectivityDelegate;
