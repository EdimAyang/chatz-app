import { useParams } from "react-router-dom";
import ChatPage from "#/components/app/chatPage";
import { queryClient } from "#/lib/query-client";
import { useEffect } from "react";

const NewChat = () => {
  const { recipientId } = useParams();

  const refreshChatData = () => {
    void queryClient.invalidateQueries({ queryKey: ["messages", recipientId] });
  };

  useEffect(() => {
    refreshChatData();
  }, [recipientId]);

  return <ChatPage recipientId={recipientId} />;
};

export default NewChat;
