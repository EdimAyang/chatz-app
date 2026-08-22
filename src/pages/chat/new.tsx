import { useParams } from "react-router-dom";
import ChatPage from "#/components/app/chatPage";

const NewChat = () => {
  const { recipientId } = useParams();

  return <ChatPage recipientId={recipientId} />;
};

export default NewChat;
