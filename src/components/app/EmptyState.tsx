import styled from "styled-components";
import type { ReactNode } from "react";

const Wrap = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: 48px 24px; gap: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  position: relative;
  padding-top: 10rem;
`;
const Icon = styled.div`
  width: 80px; height: 80px; border-radius: 28px;
  background: ${({ theme }) => theme.colors.secondarySoft};
  color: ${({ theme }) => theme.colors.secondary};
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 8px;
`;
const Title = styled.h3`
  font-size: 17px; font-weight: 700; color: ${({ theme }) => theme.colors.textPrimary};
`;
const Desc = styled.p`font-size: 14px; max-width: 280px; line-height: 1.5;`;

export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <Wrap>
      {icon && <Icon>{icon}</Icon>}
      <Title>{title}</Title>
      {description && <Desc>{description}</Desc>}
    </Wrap>
  );
}
