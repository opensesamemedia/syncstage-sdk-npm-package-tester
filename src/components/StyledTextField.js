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

  /* Change Autocomplete styles in Chrome*/
  input:-webkit-autofill,
  input:-webkit-autofill:hover, 
  input:-webkit-autofill:focus,
  textarea:-webkit-autofill,
  textarea:-webkit-autofill:hover,
  textarea:-webkit-autofill:focus,
  select:-webkit-autofill,
  select:-webkit-autofill:hover,
  select:-webkit-autofill:focus {
    border: 1px solid inherit;
    -webkit-text-fill-color: ${({ theme }) => theme.text};
    -webkit-box-shadow: 0 0 0px 1000px rgba(0, 0, 0, 0.8S) inset;
    transition: background-color 5000s ease-in-out 0s;
`;
export default StyledTextField;
