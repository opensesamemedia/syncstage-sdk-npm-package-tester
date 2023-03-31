import React, { useContext, useState } from "react";
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
import SearchIcon from "@mui/icons-material/Search";

const Regions = ({ onCreateSession }) => {
  const { zoneId, setZoneId, setCurrentStep } = useContext(AppContext);

  const [zoneList, setZoneList] = useState([
    { zoneId: "1", zoneName: "Los Angeles" },
    { zoneId: "2", zoneName: "Warsaw" },
  ]);

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
              <SearchIcon /> Region
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
              <MenuItem value={zone.zoneId}>{zone.zoneName}</MenuItem>
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
          <ButtonContained disabled={zoneId === ""} onClick={onCreateSession}>
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
