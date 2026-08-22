import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { MobileFrame } from "@/components/app/MobileFrame";




const GlobalLayout = () => {
  
  return (
    <MobileFrame>
      <Content>
        <Outlet />
      </Content>
    </MobileFrame>
  );
};

export default GlobalLayout;


const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;