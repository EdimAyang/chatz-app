import type { RefObject } from "react";
import styled from "styled-components";
import EmojiPicker, {type EmojiClickData,  Theme } from "emoji-picker-react";
import { theme } from "@/theme";

interface Props {
  handleEmojiClick: (emoji: EmojiClickData) => void;
  pickerRef?: RefObject<HTMLDivElement | null>;
}

export const EmojiPickerComponent: React.FC<Props> = ({ handleEmojiClick, pickerRef }) => {
  return (
    <EmojiWrapper ref={pickerRef}>
      <EmojiPicker
        width="100%"
        height={400}
        theme={theme.mode === "dark" ? Theme.DARK : Theme.LIGHT}
        previewConfig={{ showPreview: false }}
        // searchDisabled
        // skinTonesDisabled
        lazyLoadEmojis
        onEmojiClick={handleEmojiClick}
      />
    </EmojiWrapper>
  );
};

const EmojiWrapper = styled.div`
width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1000;

  box-shadow: ${({ theme }) => theme.shadows.md};
`;
