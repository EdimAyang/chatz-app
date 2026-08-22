import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { MobileFrame } from "@/components/app/MobileFrame";




const AppLayout = () => {
  
  return (
    <MobileFrame>
      <Content>
        <Outlet />
      </Content>
      {/* <BottomNav /> */}
    </MobileFrame>
  );
};

export default AppLayout;


const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

