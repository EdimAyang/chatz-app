import { useParams } from "react-router-dom";
import ChatPage from "#/components/app/chatPage";
import { queryClient } from "#/lib/query-client";
import { useEffect } from "react";

const Chat = () => {
  const { id } = useParams();

  const refreshChatData = () => {
    void queryClient.invalidateQueries({ queryKey: ["messages", id] });
  };

  useEffect(() => {
    refreshChatData();
  }, [id]);

  return <ChatPage conversationId={id} />;
};

export default Chat;
