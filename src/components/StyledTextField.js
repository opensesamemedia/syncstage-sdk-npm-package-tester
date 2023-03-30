import styled from "styled-components";
import { TextField } from "@mui/material";

const StyledTextField = styled(TextField)`
&& {
    label {
      color: ${({ theme }) => theme.text};
    }
    input::placeholder {
      color: ${({ theme }) => theme.text};
    }
  }
  & label.Mui-focused {
    color: ${({ theme }) => theme.text};
  }
  & .MuiOutlinedInput-root {
    color: ${({ theme }) => theme.text};
  }
  & .MuiInput-underline:after {
    border-bottom-color: white;
  }
  & .MuiOutlinedInput-root {
    & fieldset {
      border-color: white;
    }
    &:hover fieldset {
      border-color: white;
    }
    &.Mui-focused fieldset {
      border-color: white;
    }
  }
`;

export default StyledTextField;
