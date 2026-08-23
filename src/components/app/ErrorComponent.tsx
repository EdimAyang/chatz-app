import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import styled from "styled-components";
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from "lucide-react";

const ErrorComponent = () => {
  const error = useRouteError();

  let title = "Something went wrong";
  let message = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "Page not found";
      message = "The page you're looking for doesn't exist.";
    } else if (error.status === 401) {
      title = "Unauthorized";
      message = "You don't have permission to access this page.";
    } else if (error.status === 403) {
      title = "Access denied";
      message = "You don't have permission to access this resource.";
    } else {
      title = `${error.status} ${error.statusText}`;
      message =
        typeof error.data === "string"
          ? error.data
          : "Something went wrong while loading this page.";
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <Container>
      <Content>
        <IconWrapper>
          <AlertTriangle size={32} />
        </IconWrapper>

        <Title>{title}</Title>

        <Message>{message}</Message>

        <Actions>
          <BackButton onClick={() => window.history.back()}>
            <ArrowLeft size={18} />
            Go back
          </BackButton>

          <HomeLink to="/">
            <Home size={18} />
            Home
          </HomeLink>

          <RefreshButton onClick={() => window.location.reload()}>
            <RefreshCw size={18} />
            Reload
          </RefreshButton>
        </Actions>
      </Content>
    </Container>
  );
};

export default ErrorComponent;

const Container = styled.div`
  width: 100%;
  height: 100dvh;

  display: grid;
  place-items: center;

  padding: 24px;

  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Content = styled.div`
  width: min(100%, 460px);

  display: flex;
  flex-direction: column;
  align-items: center;

  text-align: center;
`;

const IconWrapper = styled.div`
  width: 72px;
  height: 72px;

  display: grid;
  place-items: center;

  margin-bottom: 20px;

  border-radius: 50%;

  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.primary};
`;

const Title = styled.h1`
  margin: 0;

  font-size: 28px;
  font-weight: 700;
`;

const Message = styled.p`
  margin: 12px 0 28px;

  max-width: 400px;

  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  flex-wrap: wrap;
`;

const ButtonBase = styled.button`
  height: 42px;

  display: inline-flex;
  align-items: center;
  gap: 8px;

  padding: 0 16px;

  border: none;
  border-radius: 10px;

  font-size: 14px;
  font-weight: 600;

  cursor: pointer;
`;

const BackButton = styled(ButtonBase)`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textTertiary};
`;

const RefreshButton = styled(ButtonBase)`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const HomeLink = styled(Link)`
  height: 42px;

  display: inline-flex;
  align-items: center;
  gap: 8px;

  padding: 0 16px;

  border-radius: 10px;

  background: ${({ theme }) => theme.colors.primary};
  color: white;

  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
`;
