import styled from 'styled-components';
import Select from '@mui/material/Select';

const StyledSelect = styled(Select)`
  color: ${({ theme }) => theme.text} !important;
  border-color: ${({ theme }) => theme.text} !important;

  .MuiOutlinedInput-notchedOutline {
    border-width: 1px !important;
    border-color: ${({ theme }) => theme.text} !important;
  }

  & > div {
    border: 1px solid ${({ theme }) => theme.text};
  }
  .MuiSelect-icon {
    color: ${({ theme }) => theme.text} !important;
  }
`;

export default StyledSelect;
