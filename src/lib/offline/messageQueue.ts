import type { ChatMessage } from "#/types";

const DB_NAME = "chatz-offline";
const DB_VERSION = 2;
const STORE_NAME = "pending-actions";

export type PendingActionType =
  | "SEND_MESSAGE"
  | "EDIT_MESSAGE"
  | "DELETE_MESSAGE"
  | "REACTION_ADD"
  | "REACTION_REMOVE";

export type PendingAction = {
  clientActionId: string;

  type: PendingActionType;

  conversationId: string;

  messageId?: string;

  senderId?: string;

  recipientId?: string;

  clientMessageId?: string;

  message?: string | null;

  messageType?: ChatMessage["messageType"];

  emoji?: string;

  file?: Blob;

  fileName?: string;

  mimeType?: string;

  duration?: number | null;

  replyToMessageId?: string | null;

  createdAt: string;
};

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onupgradeneeded = () => {
      const db = request.result;

      /*
       * Remove the old store if it exists.
       */
      if (db.objectStoreNames.contains("pending-messages")) {
        db.deleteObjectStore("pending-messages");
      }

      /*
       * Create the new generic action queue.
       */
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "clientActionId",
        });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};

export const addPendingAction = async (
  action: PendingAction,
): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).put(action);

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
  });
};

export const getPendingActions = async (): Promise<PendingAction[]> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");

    const request = transaction.objectStore(STORE_NAME).getAll();

    request.onerror = () => {
      db.close();
      reject(request.error);
    };

    request.onsuccess = () => {
      db.close();

      const actions = request.result as PendingAction[];

      /*
       * Always replay in the order they were created.
       */
      actions.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

      resolve(actions);
    };
  });
};

export const removePendingAction = async (
  clientActionId: string,
): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).delete(clientActionId);

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
  });
};

export const queueEditMessage = async (
  message: ChatMessage,
  newText: string,
) => {
  const action: PendingAction = {
    clientActionId: crypto.randomUUID(),

    type: "EDIT_MESSAGE",

    conversationId: message.conversationId,

    messageId: message.id,

    message: newText,

    createdAt: new Date().toISOString(),
  };

  await addPendingAction(action);
};

export const queueDeleteMessage = async (message: ChatMessage) => {
  const action: PendingAction = {
    clientActionId: crypto.randomUUID(),

    type: "DELETE_MESSAGE",

    conversationId: message.conversationId,

    messageId: message.id,

    createdAt: new Date().toISOString(),
  };

  await addPendingAction(action);
};

export const queueAddReaction = async (message: ChatMessage, emoji: string) => {
  const action: PendingAction = {
    clientActionId: crypto.randomUUID(),

    type: "REACTION_ADD",

    conversationId: message.conversationId,

    messageId: message.id,

    emoji,

    createdAt: new Date().toISOString(),
  };

  await addPendingAction(action);
};

export const queueRemoveReaction = async (
  message: ChatMessage,
  emoji: string,
) => {
  const action: PendingAction = {
    clientActionId: crypto.randomUUID(),

    type: "REACTION_REMOVE",

    conversationId: message.conversationId,

    messageId: message.id,

    emoji,

    createdAt: new Date().toISOString(),
  };

  await addPendingAction(action);
};
