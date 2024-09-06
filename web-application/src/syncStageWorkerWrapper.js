class SyncStageWorkerWrapper {
  constructor(userDelegate, connectivityDelegate, discoveryDelegate, desktopAgentDelegate, onTokenExpired) {
    console.log('SyncStageWorkerWrapper constructor');

    this.userDelegate = userDelegate;
    this.connectivityDelegate = connectivityDelegate;
    this.discoveryDelegate = discoveryDelegate;
    this.desktopAgentDelegate = desktopAgentDelegate;
    this.onTokenExpired = onTokenExpired;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.onDesktopAgentReconnected = () => {};

    this.worker = new Worker(new URL('worker.js', import.meta.url)); //NEW SYNTAX

    this.worker.onmessage = async (event) => {
      const { id, result, error } = event.data;

      if (this.promises[id]) {
        if (error) {
          this.promises[id].reject(new Error(error));
        } else {
          this.promises[id].resolve(result);
        }

        delete this.promises[id];
      } else {
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
          case 'onDesktopAgentDeprovisioned':
            this.desktopAgentDelegate?.onDesktopAgentDeprovisioned();
            break;
          case 'onDesktopAgentProvisioned':
            this.desktopAgentDelegate?.onDesktopAgentProvisioned();
            break;
          case 'onBrowserConnected':
            this.desktopAgentDelegate?.onBrowserConnected();
            break;
          case 'onBrowserDisconnected':
            this.desktopAgentDelegate?.onBrowserDisconnected();
            break;
          case 'onTokenExpired':
            try {
              if (typeof this.onTokenExpired === 'function') {
                const jwt = await this.onTokenExpired();
                this.updateToken(jwt);
              } else {
                console.error('onTokenExpired is not a function');
              }
            } catch (error) {
              console.error('An error occurred in onTokenExpired or updateToken:', error);
            }
            break;
          case 'onDesktopAgentReconnected':
            this.onDesktopAgentReconnected();
            break;
          default:
            console.log(`No implementation for callback ${result.callback}`);
            break;
        }
      }
    };

    this.promises = {};
    this.nextId = 0;

    this.callWorker('constructor');
  }

  callWorker(method, ...args) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.promises[id] = { resolve, reject, method };
      this.worker.postMessage({ id, method, args });
    });
  }

  updateOnDesktopAgentReconnected(onDesktopAgentReconnected) {
    this.onDesktopAgentReconnected = onDesktopAgentReconnected;
  }

  isCompatible() {
    let os;

    if (window.navigator.userAgent.indexOf('Mac') !== -1) {
      os = 'macOS';
    } else if (window.navigator.userAgent.indexOf('Win') !== -1) {
      os = 'Windows';
    }

    return this.callWorker('isCompatible', os);
  }

  getLatestCompatibleDesktopAgentVersion() {
    try {
      let os;

      if (window.navigator.userAgent.indexOf('Mac') !== -1) {
        os = 'macOS';
      } else if (window.navigator.userAgent.indexOf('Win') !== -1) {
        os = 'Windows';
      }

      return this.callWorker('getLatestCompatibleDesktopAgentVersion', os);
    } catch (error) {
      console.error('An error occurred in getLatestCompatibleDesktopAgentVersion:', error);
    }
  }

  init(jwt) {
    return this.callWorker('init', jwt);
  }

  async updateToken(token) {
    console.log('SyncStageWorkerWrapper updateToken');
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

  getSessionSettings() {
    return this.callWorker('getSessionSettings');
  }

  setInputDevice(identifier) {
    return this.callWorker('setInputDevice', identifier);
  }

  setOutputDevice(identifier) {
    return this.callWorker('setOutputDevice', identifier);
  }

  setNoiseCancellation(enabled) {
    return this.callWorker('setNoiseCancellation', enabled);
  }

  setDisableGain(disabled) {
    return this.callWorker('setDisableGain', disabled);
  }

  setDirectMonitor(enabled) {
    return this.callWorker('setDirectMonitor', enabled);
  }

  setLatencyOptimizationLevel(level) {
    return this.callWorker('setLatencyOptimizationLevel', level);
  }
}

export default SyncStageWorkerWrapper;
