import { Outlet } from "react-router-dom";
import styled from "styled-components";
import Sidebar from "@/components/app/sidebar";
import { useState } from "react";

const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <Layout>
      <DesktopSidebar $collapsed={sidebarCollapsed}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
        />
      </DesktopSidebar>

      <MainContent>
        <Outlet />
      </MainContent>
    </Layout>
  );
};

export default AppLayout;

const Layout = styled.div`
  width: 100%;
  height: 100dvh;
  display: flex;
  overflow: hidden;

  @media (min-width: 1440px) {
    width: min(1600px, 95vw);
    height: calc(100dvh - 40px);
    margin: 20px auto;
    border-radius: 12px;
    overflow: hidden;
  }
`;

const DesktopSidebar = styled.aside<{
  $collapsed: boolean;
}>`
  width: ${({ $collapsed }) => ($collapsed ? "160px" : "380px")};

  flex-shrink: 0;
  overflow: hidden;

  transition: width 0.25s ease;

  @media (min-width: 768px) and (max-width: 1023px) {
    width: ${({ $collapsed }) => ($collapsed ? "160px" : "320px")};
  }

  @media (min-width: 1024px) and (max-width: 1439px) {
    width: ${({ $collapsed }) => ($collapsed ? "160px" : "360px")};
  }

  @media (min-width: 1440px) {
    width: ${({ $collapsed }) => ($collapsed ? "150px" : "420px")};
  }

  @media (max-width: 767px) {
    display: none;
  }
`;

const MainContent = styled.main`
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: auto;
  overflow-x: hidden;
  padding-inline: 10px;
  display: flex;
  flex-direction: column;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 767px) {
    width: 100%;
    padding-inline: 10px;
    height: 100dvh;
    min-height: 0;
    overflow: hidden;
  }
`;

export const MobileNav = styled.nav`
  display: none;

  @media (max-width: 767px) {
    display: block;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 70px;
    z-index: 100;
  }
`;
