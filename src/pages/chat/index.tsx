import { useParams } from "react-router-dom";
import ChatPage from "#/components/app/chatPage";
// import { queryClient } from "#/lib/query-client";
// import { useEffect } from "react";

const Chat = () => {
  const { conversationId } = useParams();
  console.log(conversationId)

  // const refreshChatData = () => {
  //   void queryClient.invalidateQueries({ queryKey: ["messages", id] });
  // };

  // useEffect(() => {
  //   refreshChatData();
  // }, [id]);

  return <ChatPage conversationId={conversationId} />;
};

export default Chat;
