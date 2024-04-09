class SyncStageDiscoveryDelegate {
  onDiscoveryResults;
  onDiscoveryLatencyTestResults;
  onServerSelected;

  constructor(onDiscoveryResults, onDiscoveryLatencyTestResults, onServerSelected) {
    this.onDiscoveryResults = onDiscoveryResults;
    this.onDiscoveryLatencyTestResults = onDiscoveryLatencyTestResults;
    this.onServerSelected = onServerSelected;
  }

  discoveryResults(zones) {
    this.onDiscoveryResults(zones);
  }
  discoveryLatencyTestResults(results) {
    this.onDiscoveryLatencyTestResults(results);
  }
  serverSelected(selectedServer) {
    this.onServerSelected(selectedServer);
  }
}

export default SyncStageDiscoveryDelegate;
