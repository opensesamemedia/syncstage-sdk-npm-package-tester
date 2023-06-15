class SyncStageDicoveryDelegate {
  onDiscoveryResults;
  onDiscoveryLatencyTestResults;

  constructor(onDiscoveryResults, onDiscoveryLatencyTestResults) {
    this.onDiscoveryResults = onDiscoveryResults;
    this.onDiscoveryLatencyTestResults = onDiscoveryLatencyTestResults;
  }

  discoveryResults(zones) {
    this.onDiscoveryResults(zones);
  }
  discoveryLatencyTestResults(results) {
    this.onDiscoveryLatencyTestResults(results);
  }
}

export default SyncStageDicoveryDelegate;
