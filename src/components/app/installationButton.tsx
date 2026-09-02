import { usePWAInstall } from "@/hooks/usePWAInstall";
import styled from "styled-components";
import { DownloadCloud, ChevronRight } from "lucide-react";

const InstallButton = () => {
  const { canInstall, install } = usePWAInstall();

  if (!canInstall) return null;

  return (
    <Item onClick={() => install()}>
      <IconWrap $bg="#FFF1E0" $c="#FF9F40">
        <DownloadCloud size={18} />
      </IconWrap>
      <Lbl>Install app</Lbl>
      <ChevronRight color="#B5B5B5" />
    </Item>
  );
};

export default InstallButton;

const Item = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  text-align: left;
`;
const IconWrap = styled.div<{ $bg: string; $c: string }>`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: ${({ $bg }) => $bg};
  color: ${({ $c }) => $c};
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;
const Lbl = styled.span`
  flex: 1;
  font-weight: 600;
  font-size: 15px;
`;
