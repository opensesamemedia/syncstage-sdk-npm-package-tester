// SyncStageWorkerWrapper.js

class SyncStageWorkerWrapper {
  constructor(userDelegate, connectivityDelegate, discoveryDelegate, desktopAgentDelegate, onTokenExpired) {
    console.log('SyncStageWorkerWrapper constructor');

    this.userDelegate = userDelegate;
    this.connectivityDelegate = connectivityDelegate;
    this.discoveryDelegate = discoveryDelegate;
    this.desktopAgentDelegate = desktopAgentDelegate;
    this.onTokenExpired = onTokenExpired;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.onWebsocketReconnected = () => {};

    this.worker = new Worker(new URL('worker.js', import.meta.url)); //NEW SYNTAX

    this.worker.onmessage = async (event) => {
      // console.log(`SyncStageWorkerWrapper received message from worker: ${JSON.stringify(event.data)}`);
      // console.log(`SyncStageWorkerWrapper received message from worker`, event);
      const { id, result, error } = event.data;

      if (this.promises[id]) {
        if (error) {
          // console.log(`In SyncStageWorkerWrapper, error: ${error} for method: ${this.promises[id].method}`);
          this.promises[id].reject(new Error(error));
        } else {
          this.promises[id].resolve(result);
        }

        delete this.promises[id];
      } else {
        // console.log(`In switch for callbacks in wrapper, callback is: ${result.callback}, data: ${JSON.stringify(result.data)}`);
        switch (result.callback) {
          case 'onUserJoined':
            this.userDelegate?.userJoined(result.data);
            break;
          case 'onUserLeft':
            this.userDelegate?.userLeft(result.data);
            break;
          case 'onUserMuted':
            this.userDelegate?.userMuted(result.data);
            break;
          case 'onUserUnmuted':
            this.userDelegate?.userUnmuted(result.data);
            break;
          case 'onRecordingStarted':
            this.userDelegate?.sessionRecordingStarted();
            break;
          case 'onRecordingStopped':
            this.userDelegate?.sessionRecordingStopped();
            break;
          case 'onSessionOut':
            this.userDelegate?.sessionOut();
            break;
          case 'onTransmitterConnectivityChanged':
            this.connectivityDelegate?.transmitterConnectivityChanged(result.data);
            break;
          case 'onReceiverConnectivityChanged':
            this.connectivityDelegate?.receiverConnectivityChanged(result.data.identifier, result.data.connected);
            break;
          case 'onDiscoveryResults':
            this.discoveryDelegate?.discoveryResults(result.data);
            break;
          case 'onDiscoveryLatencyTestResults':
            this.discoveryDelegate?.discoveryLatencyTestResults(result.data);
            break;
          case 'onServerSelected':
            this.discoveryDelegate?.serverSelected(result.data);
            break;
          case 'onDesktopAgentAquired':
            this.desktopAgentDelegate?.onDesktopAgentAquired();
            break;
          case 'onDesktopAgentReleased':
            this.desktopAgentDelegate?.onDesktopAgentReleased();
            break;
          case 'onDesktopAgentConnected':
            this.desktopAgentDelegate?.onDesktopAgentConnected();
            break;
          case 'onDesktopAgentDisconnected':
            this.desktopAgentDelegate?.onDesktopAgentDisconnected();
            break;
          case 'onDesktopAgentRelaunched':
            this.desktopAgentDelegate?.onDesktopAgentRelaunched();
            break;
          case 'onDesktopAgentProvisioned':
            this.desktopAgentDelegate?.onDesktopAgentProvisioned();
            break;
          case 'onTokenExpired':
            this.updateToken(this.onTokenExpired());
            break;
          case 'onWebsocketReconnected':
            // console.log('SyncStageWorkerWrapper received from worker onWebsocketReconnected', this.onWebsocketReconnected);
            this.onWebsocketReconnected();
            break;
          default:
            console.log(`In SyncStageWorkerWrapper, 'No implementation for callback ${result.callback}`);
            break;
        }
      }
    };

    this.promises = {};
    this.nextId = 0;

    // console.log(this.worker);

    this.callWorker('constructor');
  }

  callWorker(method, ...args) {
    // console.log(`SyncStageWorkerWrapper callWorker: method=${method}, args=${JSON.stringify(args)}`);
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.promises[id] = { resolve, reject, method };
      this.worker.postMessage({ id, method, args });
    });
  }

  updateOnWebsocketReconnected(onWebsocketReconnected) {
    // console.log('SyncStageWorkerWrapper updateOnWebsocketReconnected', onWebsocketReconnected);
    this.onWebsocketReconnected = onWebsocketReconnected;
  }

  isCompatible() {
    // console.log('userAgent', window.navigator.userAgent);
    const os = 'macOS';
    return this.callWorker('isCompatible', os);
  }

  init(jwt) {
    return this.callWorker('init', jwt);
  }

  async updateToken(token) {
    return this.callWorker('updateToken', token);
  }

  isDesktopAgentConnected() {
    return this.callWorker('isDesktopAgentConnected');
  }

  getSDKVersion() {
    return this.callWorker('getSDKVersion');
  }

  getServerInstances() {
    return this.callWorker('getServerInstances');
  }

  createSession(userId, zoneId, studioServerId) {
    return this.callWorker('createSession', userId, zoneId, studioServerId);
  }

  join(sessionCode, userId, displayName, zoneId, studioServerId) {
    return this.callWorker('join', sessionCode, userId, displayName, zoneId, studioServerId);
  }

  leave() {
    return this.callWorker('leave');
  }

  session() {
    return this.callWorker('session');
  }

  changeReceiverVolume(identifier, volume) {
    return this.callWorker('changeReceiverVolume', identifier, volume);
  }

  getReceiverVolume(identifier) {
    return this.callWorker('getReceiverVolume', identifier);
  }

  toggleMicrophone(mute) {
    return this.callWorker('toggleMicrophone', mute);
  }

  isMicrophoneMuted() {
    return this.callWorker('isMicrophoneMuted');
  }

  getReceiverMeasurements(identifier) {
    return this.callWorker('getReceiverMeasurements', identifier);
  }

  getTransmitterMeasurements() {
    return this.callWorker('getTransmitterMeasurements');
  }

  getLatencyOptimizationLevel() {
    return this.callWorker('getLatencyOptimizationLevel');
  }

  getDesktopAgentProtocolHandler() {
    return this.callWorker('getDesktopAgentProtocolHandler');
  }

  getSelectedServer() {
    return this.callWorker('getSelectedServer');
  }

  getBestAvailableServer() {
    return this.callWorker('getBestAvailableServer');
  }

  startRecording() {
    return this.callWorker('startRecording');
  }

  stopRecording() {
    return this.callWorker('stopRecording');
  }
  checkProvisionedStatus() {
    return this.callWorker('checkProvisionedStatus');
  }
}

export default SyncStageWorkerWrapper;
