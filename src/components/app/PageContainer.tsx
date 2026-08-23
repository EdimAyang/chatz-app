import styled from "styled-components";

interface PageContainerProps {
  children: React.ReactNode;
}

const PageContainer = ({ children }: PageContainerProps) => {
  return <Container>{children}</Container>;
};

export default PageContainer;

const Container = styled.div`
  width: 100%;
  height: 100%;

  min-width: 0;
  min-height: 0;

  overflow: hidden;

  display: flex;
  flex-direction: column;
`;
