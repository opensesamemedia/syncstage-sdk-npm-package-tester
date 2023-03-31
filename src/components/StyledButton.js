import styled from "styled-components";
import { Button } from "@mui/material";

const StyledButton = styled(Button)`
  && {
    color: ${({ theme }) => theme.primary};
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    text-transform: capitalize;
  }
`;

export default StyledButton;