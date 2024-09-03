import styled from 'styled-components';
import theme from '../../ui/theme';

const SessionWrapper = styled.div`
  #footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
    height: ${(props) => (props.isRecording ? '108px' : '72px')};
    z-index: 100;
    background: ${theme.footterColor};
  }

  #redcircle {
    display: inline-block;
    vertical-align: middle;
    margin: 0 8px 18px 0;
    background-color: #93000a;
    border-color: white;
    border-radius: 50%;
    border-width: 5px;
    height: 20px;
    width: 20px;
  }
`;

export default SessionWrapper;
