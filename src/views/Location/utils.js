export function isInvalidLatency(latency) {
  if (latency === null || latency === 0) {
    return true;
  }
  return false;
}
