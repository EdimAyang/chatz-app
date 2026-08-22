import styled from "styled-components";

export const Badge = styled.span<{ $variant?: "primary" | "muted" | "success" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: ${({ theme, $variant }) =>
    $variant === "muted" ? theme.colors.textTertiary :
    $variant === "success" ? theme.colors.success :
    theme.colors.secondary};
`;
