import { SyncStageSDKErrorCode } from '@opensesamemedia/syncstage-sdk-npm-package-development';
import { enqueueSnackbar } from 'notistack';

const syncStageErrorToMessageMap = new Map();
syncStageErrorToMessageMap.set(parseInt(SyncStageSDKErrorCode.API_UNAUTHORIZED), 'Unauthorized');
syncStageErrorToMessageMap.set(parseInt(SyncStageSDKErrorCode.NOT_IN_SESSION), 'Not in a session');
syncStageErrorToMessageMap.set(
  parseInt(SyncStageSDKErrorCode.SYNCSTAGE_SERVICE_COMMUNICATION_ERROR),
  'No communication with SyncStage service.',
);
syncStageErrorToMessageMap.set(parseInt(SyncStageSDKErrorCode.TIMEOUT_ERROR), 'Desktop Agent timeout.');
syncStageErrorToMessageMap.set(parseInt(SyncStageSDKErrorCode.UNKNOWN_ERROR), 'Unknown error');
syncStageErrorToMessageMap.set(parseInt(SyncStageSDKErrorCode.CONFIGURATION_ERROR), 'Configuration error');
syncStageErrorToMessageMap.set(parseInt(SyncStageSDKErrorCode.API_ERROR), 'API error');
syncStageErrorToMessageMap.set(parseInt(SyncStageSDKErrorCode.STREAM_DOES_NOT_EXIST), 'Stream does not exist');
syncStageErrorToMessageMap.set(parseInt(SyncStageSDKErrorCode.BAD_VOLUME_VALUE), 'Incorrect volume value');
syncStageErrorToMessageMap.set(parseInt(SyncStageSDKErrorCode.NO_ZONE_AVAILABLE), 'No zone availible');
syncStageErrorToMessageMap.set(parseInt(SyncStageSDKErrorCode.NO_STUDIO_SERVER_AVAILABLE), 'No studio server availible');
syncStageErrorToMessageMap.set(parseInt(SyncStageSDKErrorCode.TOKEN_EXPIRED), 'Jwt expired');
syncStageErrorToMessageMap.set(parseInt(SyncStageSDKErrorCode.NO_INPUT_DEVICE), 'No input device');

const errorCodeToSnackbar = (errorCode, msgOnOK) => {
  if (errorCode !== SyncStageSDKErrorCode.OK) {
    const snackbarMsg = syncStageErrorToMessageMap.get(errorCode);
    console.log(snackbarMsg);

    // do not want to spam about websocket problems when tab in the browser is hidden
    if (errorCode === SyncStageSDKErrorCode.TIMEOUT_ERROR) {
      return;
    }
    if (errorCode === SyncStageSDKErrorCode.TOKEN_EXPIRED) {
      return;
    }
    enqueueSnackbar(snackbarMsg);
  } else if (msgOnOK) {
    enqueueSnackbar(msgOnOK);
  }
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const willJwtBeExpiredIn = (jwt, secondTimeRemaning) => {
  // check if token will be valid for at least the next 10 seconds
  const dateInFuture = Date.now() + secondTimeRemaning * 1000;
  try {
    const jwtExp = JSON.parse(atob(jwt.split('.')[1])).exp * 1000;

    const willBeExpired = dateInFuture >= jwtExp;
    return willBeExpired;
  } catch (error) {
    console.log(`Error checking jwt: ${error}`);
    return true;
  }
};

const extractSessionCode = (path) => {
  const match = path.match(/\/session\/([^/]*)/);
  return match?.[1]; // Extract the first captured group
};

const SESSION_PATH_REGEX = /\/session\/([a-z0-9]{9}|[a-z0-9]{3}-[a-z0-9]{3}-[a-z0-9]{3})/;

export { syncStageErrorToMessageMap, errorCodeToSnackbar, sleep, willJwtBeExpiredIn, extractSessionCode, SESSION_PATH_REGEX };
