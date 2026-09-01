import { MessageType } from "#/lib/constants";
import { MessageBubble } from "./MessageBubble";
import { formatTime } from "#/utils/dates";
import { AudioBubble } from "./AudioBubble";

interface MessageRendererProps {
  message: {
    id: string;
    conversationId: string;
    senderId: string;
    message: string;
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
    updatedAt: string | null;
    isDeleted: boolean;
    deletedAt: string | null;
    duration: number | null;
    messageType: MessageType;
    attachmentUrl: string | null;
    attachmentPublicId: string | null;
    mimeType: string | null;
  };
  mine: boolean;
}

export const MessageRenderer = ({ message, mine }: MessageRendererProps) => {
  // console.log("Rendering message:", message.message, message.isRead);
  switch (message.messageType) {
    case MessageType.TEXT:
      return (
        <MessageBubble
          mine={mine}
          text={message.message ?? ""}
          time={formatTime(message.createdAt)}
          image=""
          isRead={message.isRead}
        />
      );

    // case MessageType.IMAGE:
    //   return (
    //     <ImageBubble
    //       mine={mine}
    //       image={message.attachmentUrl ?? ""}
    //       time={formatTime(message.createdAt)}
    //     />
    //   );

    case MessageType.AUDIO:
      return (
        <AudioBubble
          mine={mine}
          audio={message.attachmentUrl ?? ""}
          duration={message.duration ?? 0}
          time={formatTime(message.createdAt)}
        />
      );

    // case MessageType.VIDEO:
    //   return (
    //     <VideoBubble
    //       mine={mine}
    //       video={message.attachmentUrl ?? ""}
    //       time={formatTime(message.createdAt)}
    //     />
    //   );

    // case MessageType.FILE:
    //   return (
    //     <FileBubble
    //       mine={mine}
    //       file={message.attachmentUrl ?? ""}
    //       time={formatTime(message.createdAt)}
    //     />
    //   );

    // case MessageType.LOCATION:
    //   return (
    //     <LocationBubble
    //       mine={mine}
    //       latitude={message.latitude}
    //       longitude={message.longitude}
    //       time={formatTime(message.createdAt)}
    //     />
    //   );

    default:
      return null;
  }
};
