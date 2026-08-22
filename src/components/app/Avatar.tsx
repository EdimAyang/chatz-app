import styled from "styled-components";

const Wrap = styled.div<{ $size: number }>`
  position: relative;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  flex-shrink: 0;
`;
const Img = styled.img`
  width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
  background: ${({ theme }) => theme.colors.divider};
`;
const Dot = styled.span<{ $size: number }>`
  position: absolute;
  bottom: 2px; right: 2px;
  width: ${({ $size }) => Math.max(10, $size * 0.25)}px;
  height: ${({ $size }) => Math.max(10, $size * 0.25)}px;
  background: ${({ theme }) => theme.colors.success};
  border-radius: 50%;
  border: 2px solid #fff;
`;
const Ring = styled.div<{ $size: number; $story?: boolean }>`
  width: ${({ $size }) => $size + 8}px;
  height: ${({ $size }) => $size + 8}px;
  border-radius: 50%;
  padding: 3px;
  background: ${({ $story, theme }) =>
    $story ? `conic-gradient(${theme.colors.secondary}, #FF9CC2, ${theme.colors.secondary})` : "transparent"};
  display: inline-flex; align-items: center; justify-content: center;
`;

export function Avatar({
  src, alt = "", size = 48, online, story,
}: { src: string; alt?: string; size?: number; online?: boolean; story?: boolean }) {
  const inner = (
    <Wrap $size={size}>
      <Img src={src} alt={alt} />
      {online && <Dot $size={size} />}
    </Wrap>
  );
  if (story) return <Ring $size={size} $story><Img src={src} alt={alt} style={{ width: size, height: size, border: `2px solid #fff` }} /></Ring>;
  return inner;
}
