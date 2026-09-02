import { Outlet } from "react-router-dom";
import styled from "styled-components";

const GlobalLayout = () => {
  return (
    <div>
      <Content>
        <Outlet />
      </Content>
    </div>
  );
};

export default GlobalLayout;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  @media (max-width: 767px) {
    height: auto;
    min-height: 100dvh;
    overflow: visible;
  }
`;
