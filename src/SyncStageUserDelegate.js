class SyncStageUserDelegate {
  onUserJoined;
  onUserLeft;
  onUserMuted;
  onUserUnmuted;
  onSessionOut;

  constructor(onUserJoined, onUserLeft, onUserMuted, onUserUnmuted, onSessionOut) {
    this.onUserJoined = onUserJoined;
    this.onUserLeft = onUserLeft;
    this.onUserMuted = onUserMuted;
    this.onUserUnmuted = onUserUnmuted;
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
  sessionOut() {
    this.onSessionOut();
  }
}

export default SyncStageUserDelegate;
