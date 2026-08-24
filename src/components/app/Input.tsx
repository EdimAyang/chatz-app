import styled from "styled-components";
import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

const Wrap = styled.label`
  display: block;
  width: 100%;
`;
const Label = styled.span`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 8px 4px;
`;

const InputErrorMessage = styled.p`
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.colors.error};
  text-align: end;
`;
const Field = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 18px;
  padding: 0 16px;
  height: 56px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  &:focus-within {
    border-color: ${({ theme }) => theme.colors.secondary};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.secondarySoft};
  }
`;
const StyledInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textPrimary};
  &::placeholder {
    color: ${({ theme }) => theme.colors.textTertiary};
  }
`;
const IconBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const IconWrap = styled.span`
  display: inline-flex;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  toggleVisibility?: boolean;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, icon, error, toggleVisibility, type = "text", ...rest },
  ref,
) {
  const [show, setShow] = useState(false);
  const effective = toggleVisibility ? (show ? "text" : "password") : type;
  return (
    <Wrap>
      {label && <Label>{label}</Label>}
      <Field>
        {icon && <IconWrap>{icon}</IconWrap>}
        <StyledInput ref={ref} type={effective} {...rest} />

        {toggleVisibility && (
          <IconBtn
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={20} /> : <Eye size={20} />}
          </IconBtn>
        )}
      </Field>
      {error && <InputErrorMessage>{error}</InputErrorMessage>}
    </Wrap>
  );
});
