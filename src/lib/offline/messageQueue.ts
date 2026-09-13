import type { ChatMessage } from "#/types";

export type PendingMessage = {
  clientMessageId: string;
  conversationId: string;
  recipientId?: string;

  message: string | null;
  messageType: ChatMessage["messageType"];

  file?: Blob;
  fileName?: string;
  mimeType?: string;

  duration?: number | null;

  replyToMessageId: string | null;
  createdAt: string;
};

const DB_NAME = "chatz-offline";
const DB_VERSION = 1;
const STORE_NAME = "pending-messages";

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "clientMessageId",
        });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};

export const addPendingMessage = async (
  message: PendingMessage,
): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).put(message);

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

export const getPendingMessages = async (): Promise<PendingMessage[]> => {
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
      resolve(request.result);
    };
  });
};

export const removePendingMessage = async (
  clientMessageId: string,
): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).delete(clientMessageId);

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
