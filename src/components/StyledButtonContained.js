import styled from "styled-components";
import { Button } from "@mui/material";

const StyledButtonContained = styled(Button)`
  && {
    background-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.onPrimary};
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    text-transform: none;
    min-width: 78px;
    
    :hover {
      background-color: ${({ theme }) => theme.primary};
      opacity: 0.9;
    }
  }
`;


export default function StyledComponent({children, onClick, disabled}) {
  return (
      <StyledButtonContained 
        variant="contained"
        style = {{
          borderRadius: 100,
        }}
        onClick={onClick}
        disabled={disabled}
      >
          {children}
      </StyledButtonContained>
  );
}