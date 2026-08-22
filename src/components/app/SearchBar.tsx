import styled from "styled-components";
import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";

const Wrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 18px;
  padding: 0 16px;
  height: 48px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;
const Field = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textPrimary};
  &::placeholder {
    color: ${({ theme }) => theme.colors.textTertiary};
  }
`;

export function SearchBar(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrap>
      <Search size={18} color="#7A7A7A" />
      <Field placeholder="Search" {...props} />
    </Wrap>
  );
}
