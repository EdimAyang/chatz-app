import { useParams } from "react-router-dom";
import ChatPage from "#/components/app/chatPage";
// import { queryClient } from "#/lib/query-client";
// import { useMemo } from "react";

const Chat = () => {
  const { conversationId } = useParams();
  console.log(conversationId)

  

  return <ChatPage conversationId={conversationId} />;
};

export default Chat;
