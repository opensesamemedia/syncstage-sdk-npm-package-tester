import { SyncStageSDKErrorCode } from '@opensesamemedia/syncstage';
import { enqueueSnackbar } from 'notistack';

const syncStageErrorToMessageMap = new Map();

syncStageErrorToMessageMap.set(parseInt(SyncStageSDKErrorCode.UNKNOWN_ERROR), 'Unknown error');
syncStageErrorToMessageMap.set(parseInt(SyncStageSDKErrorCode.CONFIGURATION_ERROR), 'Configuration error');
syncStageErrorToMessageMap.set(parseInt(SyncStageSDKErrorCode.API_ERROR), 'SyncStage service error - possibly invalid secret key');
syncStageErrorToMessageMap.set(parseInt(SyncStageSDKErrorCode.API_UNAUTHORIZED), 'Unauthorized');
syncStageErrorToMessageMap.set(parseInt(SyncStageSDKErrorCode.AUDIO_STREAMING_ERROR), 'Audio streaming error');
syncStageErrorToMessageMap.set(parseInt(SyncStageSDKErrorCode.STREAM_DOES_NOT_EXIST), 'Stream does not exist');
syncStageErrorToMessageMap.set(parseInt(SyncStageSDKErrorCode.BAD_VOLUME_VALUE), 'Incorrect volume value');
syncStageErrorToMessageMap.set(parseInt(SyncStageSDKErrorCode.SESSION_NOT_JOINED), 'Session not joined');
syncStageErrorToMessageMap.set(parseInt(SyncStageSDKErrorCode.AUDIO_SERVER_NOT_REACHABLE), 'Audio server not reachable');
syncStageErrorToMessageMap.set(
  parseInt(SyncStageSDKErrorCode.DESKTOP_AGENT_COMMUNICATION_ERROR),
  'Desktop agent communication error. Please check if SyncStage desktop agent is running.',
);

const errorCodeToSnackbar = (errorCode, msgOnOK) => {
  if (errorCode !== SyncStageSDKErrorCode.OK) {
    const snackbarMsg = syncStageErrorToMessageMap.get(errorCode);
    console.log(snackbarMsg);
    enqueueSnackbar(snackbarMsg);
  } else if (msgOnOK) {
    enqueueSnackbar(msgOnOK);
  }
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export { syncStageErrorToMessageMap, errorCodeToSnackbar, sleep };
