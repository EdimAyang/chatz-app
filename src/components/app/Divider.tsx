import styled from "styled-components";

export const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.divider};
  width: 100%;
`;
