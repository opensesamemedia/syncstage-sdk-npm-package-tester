import React, { useContext, useState, useEffect } from "react";
import { Grid } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "../../components/StyledSelect";
import ButtonContained from "../../components/StyledButtonContained";
import Button from "../../components/StyledButton";
import AppContext from "../../AppContext";
import { PathEnum } from "../../router/PathEnum";
import theme from "../../ui/theme";
import { errorCodeToSnackbar } from "../../utils";
import { SyncStageSDKErrorCode } from "@opensesamemedia/syncstage-sdk-npm-package-development";

const Regions = ({ onCreateSession }) => {
  const { zoneId, setZoneId, setCurrentStep, syncStage, setBackdropOpen } =
    useContext(AppContext);

  const [zoneList, setZoneList] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setBackdropOpen(true);
      const [data, errorCode] = await syncStage.zonesList();
      setBackdropOpen(false);
      if (errorCode === SyncStageSDKErrorCode.OK) {
        setZoneList(data);
      } else {
        errorCodeToSnackbar(errorCode);
        setZoneList([]);
      }
    }
    fetchData();
  },[syncStage]);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <h2>Region</h2>
      </Grid>
      <Grid item>
        <p>Select the closest location for all the session participants.</p>
      </Grid>
      <Grid item>
        <FormControl fullWidth style={{ maxWidth: "400px" }}>
          {zoneId === "" ? (
            <InputLabel
              id="region-select-label"
              style={{
                color: theme.text,
              }}
              shrink={false}
            >
              Region
            </InputLabel>
          ) : (
            <></>
          )}

          <Select
            labelId="region-select-label"
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
          >
            {zoneList.map((zone) => (
              <MenuItem value={zone.zoneId} key={zone.zoneId}>{zone.zoneName}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        style={{ maxWidth: "500px" }}
      >
        <Grid item style={{ height: "30px" }} />

        <Grid item>
          <ButtonContained disabled={zoneId === ""} onClick={async () => onCreateSession()}>
            Start now
          </ButtonContained>
        </Grid>
      </Grid>
      <Grid item style={{ height: "80px" }} />
      <Grid container justifyContent="flex-start">
        <Grid item>
          <Button
            onClick={() => {
              setCurrentStep(PathEnum.SESSIONS_JOIN);
            }}
          >
            Previous
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Regions;
