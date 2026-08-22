import {create} from 'zustand'
import type { Message } from '@/types';

interface ConversationState {
  addMessage:(message: Message)=> void;
  messages: Message[]
}



export const useConversationStore = create<ConversationState>((set) => ({
  messages: [],

  addMessage: (message: Message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
}));