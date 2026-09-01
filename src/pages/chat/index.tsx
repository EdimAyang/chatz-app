import { useParams } from "react-router-dom";
import ChatPage from "#/components/app/chatPage";

const Chat = () => {
  const { id } = useParams();

  return <ChatPage conversationId={id} />;
};

export default Chat