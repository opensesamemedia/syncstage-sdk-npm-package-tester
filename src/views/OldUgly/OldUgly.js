import React from "react";
import { OldUglyWrapper } from "./OldUgly.styled";
import { useState } from "react";

import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

import SyncStage from "@opensesamemedia/syncstage-sdk-npm-package-development";

const SyncStageDashboard = () => {
  const [applicationSecretId, setApplicationSecretId] = useState(
    process.env.REACT_APP_SYNCSTAGE_SECRET_ID
  );
  const [applicationSecretKey, setApplicationSecretKey] = useState(
    process.env.REACT_APP_SYNCSTAGE_SECRET_KEY
  );
  const [port, setPort] = useState(18080);
  const [syncStage, setSyncStage] = useState(null);
  const [initErrorCode, setInitErrorCode] = useState(undefined);
  const [zonesList, setZonesList] = useState([undefined, undefined]);
  const [createdSession, setCreatedSession] = useState([undefined, undefined]);
  const [zoneId, setZoneId] = useState("");
  const [userId, setUserId] = useState("");
  const [sessionCode, setSessionCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [receiverVolume, setReceiverVolume] = useState("");
  const [joinedSession, setJoinedSession] = useState([undefined, undefined]);
  const [leaveErrorCode, setLeaveErrorCode] = useState(undefined);
  const [session, setSession] = useState([undefined, undefined]);
  const [receiverVolumeResponse, setReceiverVolumeResponse] = useState([
    undefined,
    undefined,
  ]);
  const [isMicrophoneMutedResponse, setIsMicrophoneMutedResponse] = useState([
    undefined,
    undefined,
  ]);
  const [changeReceiverVolumeErrorCode, setChangeReceiverVolumeErrorCode] =
    useState(undefined);
  const [toggleMicrophoneErrorCode, setToggleMicrophoneErrorCode] =
    useState(undefined);
  const [mute, setMute] = useState(false);

  const [receiverMeasurementsResponse, setReceiverMeasurementsResponse] =
    useState([undefined, undefined]);

  const [transmitterMeasurementsResponse, setTransmitterMeasurementsResponse] =
    useState([undefined, undefined]);

  return (
    <OldUglyWrapper>
      <h1>SyncStage React.js testapp</h1>
      <br />

      <Container fluid>
        <h2>init</h2>
        <Row>
          <Col>
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-sm">
                applicationSecretId
              </InputGroup.Text>
              <Form.Control
                aria-label="applicationSecretId"
                aria-describedby="inputGroup-sizing-sm"
                value={applicationSecretId}
                onChange={(e) => setApplicationSecretId(e.target.value)}
              />
            </InputGroup>
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-sm">
                applicationSecretKey
              </InputGroup.Text>
              <Form.Control
                aria-label="applicationSecretKey"
                aria-describedby="inputGroup-sizing-sm"
                value={applicationSecretKey}
                onChange={(e) => setApplicationSecretKey(e.target.value)}
              />
            </InputGroup>
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-sm">port</InputGroup.Text>
              <Form.Control
                aria-label="port"
                aria-describedby="inputGroup-sizing-sm"
                value={port}
                onChange={(e) => setPort(parseInt(e.target.value))}
              />
            </InputGroup>
          </Col>
          <Col>
            <Button
              variant="primary"
              onClick={async () => {
                const syncStage = new SyncStage(null, null, port);
                setInitErrorCode(
                  await syncStage.init(
                    applicationSecretId,
                    applicationSecretKey
                  )
                );
                setSyncStage(syncStage);
              }}
            >
              Init
            </Button>
          </Col>
          <Col>
            <p>init error code: {initErrorCode}</p>
          </Col>
        </Row>

        <h2>zonesList</h2>
        <Row>
          <Col>
            <Button
              variant="primary"
              onClick={async () => {
                const [response, errorCode] = await syncStage.zonesList();
                setZonesList([JSON.stringify(response), errorCode]);
              }}
            >
              Get zones list
            </Button>
          </Col>
          <Col>
            <p>ZonesList: {zonesList}</p>
          </Col>
        </Row>

        <h2>createSession</h2>
        <Row>
          <Col sm={6}>
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-sm">
                zoneId
              </InputGroup.Text>
              <Form.Control
                aria-label="zoneId"
                aria-describedby="inputGroup-sizing-sm"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
              />
            </InputGroup>
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-sm">
                userId
              </InputGroup.Text>
              <Form.Control
                aria-label="userId"
                aria-describedby="inputGroup-sizing-sm"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col>
            <Button
              variant="primary"
              onClick={async () => {
                const [response, errorCode] = await syncStage.createSession(
                  zoneId,
                  userId
                );
                setCreatedSession([JSON.stringify(response), errorCode]);
              }}
            >
              Create session
            </Button>
          </Col>
          <Col>
            <p>CreatedSession: {createdSession}</p>
          </Col>
        </Row>

        <h2>join</h2>
        <Row>
          <Col sm={6}>
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-sm">
                sessionCode
              </InputGroup.Text>
              <Form.Control
                aria-label="sessionCode"
                aria-describedby="inputGroup-sizing-sm"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value)}
              />
            </InputGroup>
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-sm">
                userId
              </InputGroup.Text>
              <Form.Control
                aria-label="userId"
                aria-describedby="inputGroup-sizing-sm"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </InputGroup>
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-sm">
                displayName
              </InputGroup.Text>
              <Form.Control
                aria-label="displayName"
                aria-describedby="inputGroup-sizing-sm"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col>
            <Button
              variant="primary"
              onClick={async () => {
                const [response, errorCode] = await syncStage.join(
                  sessionCode,
                  userId,
                  displayName
                );
                setJoinedSession([JSON.stringify(response), errorCode]);
              }}
            >
              Join session
            </Button>
          </Col>
          <Col>
            <p>Joined session: {joinedSession}</p>
          </Col>
        </Row>

        <h2>leave</h2>
        <Row>
          <Col>
            <Button
              variant="primary"
              onClick={async () => {
                const errorCode = await syncStage.leave();
                setLeaveErrorCode(errorCode);
              }}
            >
              Leave session
            </Button>
          </Col>
          <Col>
            <p>leave error code: {leaveErrorCode}</p>
          </Col>
        </Row>

        <h2>session</h2>
        <Row>
          <Col>
            <Button
              variant="primary"
              onClick={async () => {
                const [response, errorCode] = await syncStage.session();
                setSession([JSON.stringify(response), errorCode]);
              }}
            >
              Get session
            </Button>
          </Col>
          <Col>
            <p>session: {session}</p>
          </Col>
        </Row>

        <h2>changeReceiverVolume</h2>
        <Row>
          <Col sm={6}>
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-sm">
                identifier
              </InputGroup.Text>
              <Form.Control
                aria-label="identifier"
                aria-describedby="inputGroup-sizing-sm"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </InputGroup>
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-sm">
                receiverVolume
              </InputGroup.Text>
              <Form.Control
                aria-label="receiverVolume"
                aria-describedby="inputGroup-sizing-sm"
                value={receiverVolume}
                onChange={(e) => setReceiverVolume(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col>
            <Button
              variant="primary"
              onClick={async () => {
                const errorCode = await syncStage.changeReceiverVolume(
                  identifier,
                  parseInt(receiverVolume)
                );
                setChangeReceiverVolumeErrorCode(errorCode);
              }}
            >
              ChangeReceiverVolume
            </Button>
          </Col>
          <Col>
            <p>
              Change receiver volume error code: {changeReceiverVolumeErrorCode}
            </p>
          </Col>
        </Row>

        <h2>getReceiverVolume</h2>
        <Row>
          <Col sm={6}>
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-sm">
                identifier
              </InputGroup.Text>
              <Form.Control
                aria-label="identifier"
                aria-describedby="inputGroup-sizing-sm"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col>
            <Button
              variant="primary"
              onClick={async () => {
                const [response, errorCode] = await syncStage.getReceiverVolume(
                  identifier
                );
                setReceiverVolumeResponse([response, errorCode]);
              }}
            >
              Get receiver volume
            </Button>
          </Col>
          <Col>
            <p>
              Get receiver volume: {receiverVolumeResponse[0]}{" "}
              {receiverVolumeResponse[1]}
            </p>
          </Col>
        </Row>

        <h2>toggleMicrophone</h2>
        <Row>
          <Col>
            <Form>
              <Form.Check
                type="switch"
                id="mute-switch"
                label="Mute"
                value={mute}
                onChange={(e) => {
                  setMute(e.target.checked);
                }}
              />
            </Form>
          </Col>
          <Col>
            <Button
              variant="primary"
              onClick={async () => {
                const errorCode = await syncStage.toggleMicrophone(mute);
                setToggleMicrophoneErrorCode(errorCode);
              }}
            >
              Toggle microphone
            </Button>
          </Col>
          <Col>
            <p>Toggle microphone error code: {toggleMicrophoneErrorCode}</p>
          </Col>
        </Row>

        <h2>isMicrophoneMuted</h2>
        <Row>
          <Col>
            <Button
              variant="primary"
              onClick={async () => {
                const [response, errorCode] =
                  await syncStage.isMicrophoneMuted();
                console.log(`${response} ${errorCode}`);
                setIsMicrophoneMutedResponse([response, errorCode]);
              }}
            >
              Is microphone muted
            </Button>
          </Col>
          <Col>
            <p>
              Is microphone muted: {isMicrophoneMutedResponse[0]}{" "}
              {isMicrophoneMutedResponse[1]}
            </p>
          </Col>
        </Row>

        <h2>getReceiverMeasurements</h2>
        <Row>
          <Col sm={6}>
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-sm">
                identifier
              </InputGroup.Text>
              <Form.Control
                aria-label="identifier"
                aria-describedby="inputGroup-sizing-sm"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col>
            <Button
              variant="primary"
              onClick={async () => {
                const [response, errorCode] =
                  await syncStage.getReceiverMeasurements(identifier);
                setReceiverMeasurementsResponse([
                  JSON.stringify(response),
                  errorCode,
                ]);
              }}
            >
              Get receiver measurements
            </Button>
          </Col>
          <Col>
            <p>
              Receiver measurements: {receiverMeasurementsResponse[0]}{" "}
              {receiverMeasurementsResponse[1]}
            </p>
          </Col>
        </Row>

        <h2>getTransmitterMeasurements</h2>
        <Row>
          <Col>
            <Button
              variant="primary"
              onClick={async () => {
                const [response, errorCode] =
                  await syncStage.getTransmitterMeasurements();
                setTransmitterMeasurementsResponse([
                  JSON.stringify(response),
                  errorCode,
                ]);
              }}
            >
              Get transmitter measurements
            </Button>
          </Col>
          <Col>
            <p>
              Transmitter measurements: {transmitterMeasurementsResponse[0]}{" "}
              {transmitterMeasurementsResponse[1]}
            </p>
          </Col>
        </Row>
      </Container>
    </OldUglyWrapper>
  );
};

SyncStageDashboard.propTypes = {};

SyncStageDashboard.defaultProps = {};

export default SyncStageDashboard;
