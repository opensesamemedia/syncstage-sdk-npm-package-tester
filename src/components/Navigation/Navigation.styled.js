import styled from 'styled-components';

const NavigationWrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 70px;
  top: 0;
  left: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-inline: 2rem;
  margin-top: ${(props) => (props.inSession ? '30px' : '60px')};
  transition: margin-top 0.5s ease-in-out;
`;

export default NavigationWrapper;
