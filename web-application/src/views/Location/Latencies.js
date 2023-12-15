import React, { useContext, useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import ButtonContained from '../../components/StyledButtonContained';
import Button from '../../components/StyledButton';
import AppContext from '../../AppContext';
import { PathEnum } from '../../router/PathEnum';
import { errorCodeToSnackbar } from '../../utils';
import { SyncStageSDKErrorCode } from '@opensesamemedia/syncstage';
import SyncStageDicoveryDelegate from '../../SyncStageDiscoveryDelegate';
import styled from 'styled-components';
import { isInvalidLatency } from './utils';

const Table = styled.table`
  border-collapse: collapse;
  width: 100%;
`;

const Cell = styled.td`
  border: none;
  border-bottom: 1px solid #fff;
  padding: 10px;
  font-weight: ${(props) => (props.isBestServer ? 'bold' : 'normal')};
`;

const Latencies = () => {
  const { selectedServer, setSelectedServer, setCurrentStep, syncStage, setBackdropOpen } = useContext(AppContext);

  const [bestServer, setBestServer] = useState(null);
  const [bestServerMarkedOnList, setBestServerMarkedOnList] = useState(false);

  const [zones, setZones] = useState([]);
  const [latencyTestResults, setLatencyTestResults] = useState([]);

  const onDiscoveryResults = (zones) => {
    setZones(zones);
  };

  const onDiscoveryLatencyTestResults = (results) => {
    setLatencyTestResults(
      results.sort((a, b) => {
        if (isInvalidLatency(a.latency)) return 1;
        if (isInvalidLatency(b.latency)) return -1;
        return a.latency - b.latency;
      }),
    );
  };

  useEffect(() => {
    async function executeAsync() {
      if (syncStage !== null) {
        syncStage.discoveryDelegate = new SyncStageDicoveryDelegate(onDiscoveryResults, onDiscoveryLatencyTestResults);
      }
    }
    executeAsync();
    return () => {
      if (syncStage !== null) {
        syncStage.discoveryDelegate = null;
      }
    };
  }, [syncStage]);

  useEffect(() => {
    async function fetchData() {
      if (!syncStage) return;

      setBackdropOpen(true);
      const [data, errorCode] = await syncStage.getBestAvailableServer();
      setBackdropOpen(false);
      if (errorCode === SyncStageSDKErrorCode.OK) {
        setBestServer(data);
        setSelectedServer(data);
      } else {
        errorCodeToSnackbar(errorCode, '');
        setBestServer([]);
      }
    }
    fetchData();
  }, [syncStage]);

  useEffect(() => {
    if (latencyTestResults.length && bestServer && !bestServerMarkedOnList) {
      const tempResults = [...latencyTestResults];

      tempResults.forEach((element) => {
        element.bestServer = bestServer.zoneName == element.name;
      });
      setBestServerMarkedOnList(true);
      setLatencyTestResults(tempResults);
    }
  }, [latencyTestResults, bestServer, bestServerMarkedOnList]);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <h2>Location</h2>
      </Grid>

      <Grid item>
        {!zones.length && !latencyTestResults.length ? (
          <p>Looking for the best Studio Server...</p>
        ) : (
          <p>Network latency to different Studio Servers.</p>
        )}
      </Grid>
      <Grid item>
        {zones.length && !latencyTestResults.length ? (
          <Table>
            <tbody>
              {zones.map((zone) => (
                <tr key={zone}>
                  <Cell>{zone}</Cell>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <></>
        )}
      </Grid>
      <Grid item>
        {latencyTestResults.length ? (
          <Table>
            <tbody>
              {latencyTestResults.map((result) => (
                <tr key={result.name}>
                  <Cell isBestServer={result.bestServer}>{result.name}</Cell>

                  {!isInvalidLatency(result.latency) ? (
                    <Cell isBestServer={result.bestServer}>{result.latency} ms</Cell>
                  ) : (
                    <Cell isBestServer={result.bestServer}>n/a</Cell>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <></>
        )}
      </Grid>

      <Grid item style={{ height: '80px' }} />
      <Grid container justifyContent="space-between">
        <Grid item>
          <Button onClick={() => setCurrentStep(PathEnum.LOCATION)}>Previous</Button>
        </Grid>
        <Grid item>
          <ButtonContained
            onClick={() => {
              setCurrentStep(PathEnum.SESSIONS_JOIN);
            }}
            disabled={!selectedServer}
          >
            Next
          </ButtonContained>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Latencies;
