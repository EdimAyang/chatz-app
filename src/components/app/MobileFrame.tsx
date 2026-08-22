import styled from "styled-components";
import type { ReactNode } from "react";

const Frame = styled.div`
  height: 100dvh;
  width: 100%;
  max-width: 460px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.background};

  display: flex;
  flex-direction: column;

  position: relative;

  min-height: 0;
`;
export function MobileFrame({ children }: { children: ReactNode }) {
  return <Frame>{children}</Frame>;
}
