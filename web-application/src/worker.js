import SyncStage from '@opensesamemedia/syncstage-sdk-npm-package-development';
import SyncStageUserDelegate from './SyncStageUserDelegate';
import SyncStageConnectivityDelegate from './SyncStageConnectivityDelegate';
import SyncStageDiscoveryDelegate from './SyncStageDiscoveryDelegate';
import SyncStageDesktopAgentDelegate from './SyncStageDesktopAgentDelegate';

let syncStage;

self.onmessage = function (e) {
  // console.log('worker.js received message from main thread', e);
  const { id, method, args } = e.data;

  const userDelegate = new SyncStageUserDelegate(
    (connection) => {
      self.postMessage({ id: -1, result: { callback: 'onUserJoined', data: connection } });
    }, //onUserJoined
    (identifier) => {
      self.postMessage({ id: -1, result: { callback: 'onUserLeft', data: identifier } });
    }, //onUserLeft
    (identifier) => {
      self.postMessage({ id: -1, result: { callback: 'onUserMuted', data: identifier } });
    }, //onUserMuted
    (identifier) => {
      self.postMessage({ id: -1, result: { callback: 'onUserUnmuted', data: identifier } });
    }, //onUserUnmuted
    () => {
      self.postMessage({ id: -1, result: { callback: 'onRecordingStarted' } });
    }, //onRecordingStarted
    () => {
      self.postMessage({ id: -1, result: { callback: 'onRecordingStopped' } });
    }, //onRecordingStopped
    () => {
      self.postMessage({ id: -1, result: { callback: 'onSessionOut' } });
    }, //onSessionOut
  );
  const connectivityDelegate = new SyncStageConnectivityDelegate(
    (connected) => {
      self.postMessage({ id: -1, result: { callback: 'onTransmitterConnectivityChanged', data: connected } });
    }, //onTransmitterConnectivityChanged
    (identifier, connected) => {
      self.postMessage({ id: -1, result: { callback: 'onReceiverConnectivityChanged', data: { identifier, connected } } });
    }, //onReceiverConnectivityChanged
  );

  const discoveryDelegate = new SyncStageDiscoveryDelegate(
    (zones) => {
      self.postMessage({ id: -1, result: { callback: 'onDiscoveryResults', data: zones } });
    }, //onDiscoveryResults
    (results) => {
      self.postMessage({ id: -1, result: { callback: 'onDiscoveryLatencyTestResults', data: results } });
    }, //onDiscoveryLatencyTestResults
    (selectedServer) => {
      self.postMessage({ id: -1, result: { callback: 'onServerSelected', data: selectedServer } });
    }, //onServerSelected
  );
  const desktopAgentDelegate = new SyncStageDesktopAgentDelegate(
    () => {
      self.postMessage({ id: -1, result: { callback: 'onDesktopAgentAquired' } });
    }, //onDesktopAgentAquired
    () => {
      self.postMessage({ id: -1, result: { callback: 'onDesktopAgentReleased' } });
    }, //onDesktopAgentReleased
    () => {
      self.postMessage({ id: -1, result: { callback: 'onDesktopAgentConnected' } });
    }, //onDesktopAgentConnected
    () => {
      self.postMessage({ id: -1, result: { callback: 'onDesktopAgentDisconnected' } });
    }, //onDesktopAgentDisconnected
    () => {
      self.postMessage({ id: -1, result: { callback: 'onDesktopAgentRelaunched' } });
    }, //onDesktopAgentRelaunched
  );

  const onTokenExpired = () => {
    self.postMessage({ id: -1, result: { callback: 'onTokenExpired' } });
  };

  if (method === 'constructor') {
    syncStage = new SyncStage(userDelegate, connectivityDelegate, discoveryDelegate, desktopAgentDelegate, onTokenExpired);
    syncStage.updateOnWebsocketReconnected(() => {
      // console.log('worker.js onWebsocketReconnected');
      self.postMessage({ id: -1, result: { callback: 'onWebsocketReconnected' } });
    });
    // eslint-disable-next-line
    self.postMessage({ id, result: 'SyncStage initialized in worker.' });
    // console.log('worker.js SyncStage initialized in worker.');
  } else if (syncStage && typeof syncStage[method] === 'function') {
    console.log(`received function in worker: ${method}`);
    Promise.resolve(syncStage[method](...args))
      .then((result) => {
        // eslint-disable-next-line
        console.log(`worker.js SyncStage method ${method} resolved with result: ${result}`);
        self.postMessage({ id, result });
      })
      .catch((error) => {
        // eslint-disable-next-line
        self.postMessage({ id, error: error.message });
      });
  }
};
