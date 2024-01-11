import { SyncStageSDKErrorCode } from '@opensesamemedia/syncstage-sdk-npm-package-development';
import { enqueueSnackbar } from 'notistack';

const syncStageErrorToMessageMap = new Map();
syncStageErrorToMessageMap.set(parseInt(SyncStageSDKErrorCode.API_UNAUTHORIZED), 'Unauthorized');
syncStageErrorToMessageMap.set(
  parseInt(SyncStageSDKErrorCode.SYNCSTAGE_SERVICE_COMMUNICATION_ERROR),
  'No communication with SyncStage service.',
);
syncStageErrorToMessageMap.set(
  parseInt(SyncStageSDKErrorCode.DESKTOP_AGENT_COMMUNICATION_ERROR),
  'Please check if SyncStage desktop agent is running.',
);
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
    // do not want to spam about websocket problems when tab in the browser is hidden
    if (errorCode === SyncStageSDKErrorCode.DESKTOP_AGENT_COMMUNICATION_ERROR && document.hidden) {
      return;
    }
    console.log(snackbarMsg);
    enqueueSnackbar(snackbarMsg);
  } else if (msgOnOK) {
    enqueueSnackbar(msgOnOK);
  }
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export { syncStageErrorToMessageMap, errorCodeToSnackbar, sleep };
