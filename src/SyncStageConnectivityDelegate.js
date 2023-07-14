class SyncStageConnectivityDelegate {
  onTransmitterConnectivityChanged;
  onReceiverConnectivityChanged;

  constructor(onTransmitterConnectivityChanged, onReceiverConnectivityChanged) {
    this.onTransmitterConnectivityChanged = onTransmitterConnectivityChanged;
    this.onReceiverConnectivityChanged = onReceiverConnectivityChanged;
  }

  transmitterConnectivityChanged(connected) {
    this.onTransmitterConnectivityChanged(connected);
  }
  receiverConnectivityChanged(identifier, connected) {
    this.onReceiverConnectivityChanged(identifier, connected);
  }
}

export default SyncStageConnectivityDelegate;
