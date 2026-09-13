import { MessageType } from "#/lib/constants";
import {
  getPendingMessages,
  removePendingMessage,
} from "#/lib/offline/messageQueue";
import {
  useSendAudio,
  useSendFile,
  useSendImage,
  useSendVideo,
} from "./mutations/useSendMessage";

export const useSyncPendingMedia = () => {
  const { mutateAsync: sendImage } = useSendImage();
  const { mutateAsync: sendVideo } = useSendVideo();
  const { mutateAsync: sendAudio } = useSendAudio();
  const { mutateAsync: sendFile } = useSendFile();

  let isSyncingMedia = false;

  const syncPendingMedia = async () => {
    // ---------------------------------------------
    // DON'T START IF ALREADY SYNCING
    // ---------------------------------------------

    if (isSyncingMedia) {
      console.log("Media sync already running");
      return;
    }

    // ---------------------------------------------
    // DON'T START WHILE OFFLINE
    // ---------------------------------------------

    if (!navigator.onLine) {
      console.log("Currently offline");
      return;
    }

    isSyncingMedia = true;

    try {
      const pendingMessages = await getPendingMessages();

      const pendingMedia = pendingMessages.filter(
        (message) =>
          message.file &&
          [
            MessageType.IMAGE,
            MessageType.VIDEO,
            MessageType.AUDIO,
            MessageType.FILE,
          ].includes(message.messageType),
      );

      // ---------------------------------------------
      // PROCESS ONE AT A TIME
      // ---------------------------------------------

      for (const pending of pendingMedia) {
        if (!pending.file) continue;

        try {
          const formData = new FormData();

          // -----------------------------------------
          // ATTACH MEDIA
          // -----------------------------------------

          if (pending.messageType === MessageType.IMAGE) {
            formData.append("image", pending.file, pending.fileName);
          }

          if (pending.messageType === MessageType.VIDEO) {
            formData.append("video", pending.file, pending.fileName);
          }

          if (pending.messageType === MessageType.AUDIO) {
            formData.append("audio", pending.file, pending.fileName);
          }

          if (pending.messageType === MessageType.FILE) {
            formData.append("file", pending.file, pending.fileName);
          }

          // -----------------------------------------
          // METADATA
          // -----------------------------------------

          formData.append(
            "clientMessageId",
            pending.clientMessageId,
          );

          formData.append(
            "conversationId",
            pending.conversationId,
          );

          if (pending.recipientId) {
            formData.append(
              "recipientId",
              pending.recipientId,
            );
          }

          if (pending.duration != null) {
            formData.append(
              "duration",
              String(pending.duration),
            );
          }

          if (pending.replyToMessageId) {
            formData.append(
              "replyToMessageId",
              pending.replyToMessageId,
            );
          }

          // -----------------------------------------
          // SEND ONE MEDIA MESSAGE
          // -----------------------------------------

          if (pending.messageType === MessageType.IMAGE) {
            await sendImage(formData);
          } else if (pending.messageType === MessageType.VIDEO) {
            await sendVideo(formData);
          } else if (pending.messageType === MessageType.AUDIO) {
            await sendAudio(formData);
          } else if (pending.messageType === MessageType.FILE) {
            await sendFile(formData);
          }

          // -----------------------------------------
          // REMOVE ONLY AFTER SUCCESS
          // -----------------------------------------

          await removePendingMessage(
            pending.clientMessageId,
          );

          console.log(
            "PENDING MEDIA SYNCED:",
            pending.clientMessageId,
          );
        } catch (error) {
          console.error(
            "PENDING MEDIA SYNC FAILED:",
            pending.clientMessageId,
            error,
          );

          // Keep failed message in IndexedDB.
        }
      }
    } catch (error) {
      console.error("MEDIA SYNC ERROR:", error);
    } finally {
      // ---------------------------------------------
      // UNLOCK ONLY AFTER THE ENTIRE QUEUE FINISHES
      // ---------------------------------------------

      isSyncingMedia = false;
    }
  };

  return { syncPendingMedia };
};