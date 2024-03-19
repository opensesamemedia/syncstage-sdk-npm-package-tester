class SyncStageUserDelegate {
  onUserJoined;
  onUserLeft;
  onUserMuted;
  onUserUnmuted;
  onRecordingStarted;
  onRecordingStopped;
  onSessionOut;

  constructor(onUserJoined, onUserLeft, onUserMuted, onUserUnmuted, onRecordingStarted, onRecordingStopped, onSessionOut) {
    this.onUserJoined = onUserJoined;
    this.onUserLeft = onUserLeft;
    this.onUserMuted = onUserMuted;
    this.onUserUnmuted = onUserUnmuted;
    this.onRecordingStarted = onRecordingStarted;
    this.onRecordingStopped = onRecordingStopped;
    this.onSessionOut = onSessionOut;
  }

  userJoined(connection) {
    this.onUserJoined(connection);
  }
  userLeft(identifier) {
    this.onUserLeft(identifier);
  }
  userMuted(identifier) {
    this.onUserMuted(identifier);
  }
  userUnmuted(identifier) {
    this.onUserUnmuted(identifier);
  }
  sessionRecordingStarted() {
    this.onRecordingStarted();
  }
  sessionRecordingStopped() {
    this.onRecordingStopped();
  }
  sessionOut() {
    this.onSessionOut();
  }
}

export default SyncStageUserDelegate;
