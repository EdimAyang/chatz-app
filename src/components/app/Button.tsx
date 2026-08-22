import styled, { css, keyframes } from "styled-components";
import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";

type Size = "sm" | "md" | "lg";

const variants = {
  primary: css`
    background: ${({ theme }) => theme.colors.secondary};
    color: #fff;
    box-shadow: ${({ theme }) => theme.shadows.orange};
  `,

  secondary: css`
    background: ${({ theme }) => theme.colors.secondarySoft};
    color: ${({ theme }) => theme.colors.secondary};
  `,

  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.textPrimary};
  `,

  outline: css`
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};
    border: 1px solid ${({ theme }) => theme.colors.border};
  `,
};

const sizes = {
  sm: css`
    height: 40px;
    padding: 0 16px;
    font-size: 14px;
    border-radius: 14px;
  `,

  md: css`
    height: 52px;
    padding: 0 22px;
    font-size: 15px;
    border-radius: 18px;
  `,

  lg: css`
    height: 58px;
    padding: 0 26px;
    font-size: 16px;
    border-radius: 20px;
  `,
};

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const StyledButton = styled(motion.button)<{
  $variant: Variant;
  $size: Size;
  $full?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  font-weight: 600;
  letter-spacing: -0.01em;

  width: ${({ $full }) => ($full ? "100%" : "auto")};

  transition: filter 0.2s ease;

  &:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  ${({ $variant }) => variants[$variant]}
  ${({ $size }) => sizes[$size]}
`;

const Spinner = styled.span`
  width: 18px;
  height: 18px;

  border: 2px solid currentColor;
  border-top-color: transparent;

  border-radius: 50%;

  animation: ${spin} 0.7s linear infinite;
`;

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "ref"> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "lg",
  full,
  isLoading = false,
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $full={full}
      disabled={disabled || isLoading}
      whileTap={!isLoading ? { scale: 0.97 } : undefined}
      whileHover={!isLoading ? { filter: "brightness(1.03)" } : undefined}
      {...(rest as any)}
    >
      {isLoading ? <Spinner aria-label="Loading" /> : children}
    </StyledButton>
  );
}
