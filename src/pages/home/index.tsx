import { Link } from "react-router-dom";
import { useMemo } from "react";
import styled from "styled-components";
import { Search, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "@/components/app/Avatar";
import { ConversationCard } from "@/components/app/ConversationCard";
import { useUserProfile } from "@/store/auth.store";
import { getGreeting } from "@/utils/dates";
import { useGetConversationsQuery } from "@/hooks/queries/useConversation";
import { EmptyState } from "@/components/app/EmptyState";
import { EmptyBoxIcon } from "@/components/icons/emptyBox";
import { useWebSocketStore } from "#/store/websocket.store";
import { LoadingScreen } from "#/components/app/Loader";
import { PATHS } from "#/lib/paths";
import { BottomNav } from "@/components/app/BottomNav";
import { MobileNav } from "#/layouts/appLayouts";
import DesktopEmptyChat from "#/components/app/EmptyChat";
// import { EmptyState } from "@/components/app/EmptyState";
// import toast from "react-hot-toast";
import { useMediaQuery } from "#/hooks/useMediaQuery";

const Home = () => {
  // const [toast, setToast] = useState(false);
  const { profile } = useUserProfile();
  const { isConnected } = useWebSocketStore();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { data, isLoading } = useGetConversationsQuery("50");

  const conversations = useMemo(() => {
    const result = data?.pages.flatMap((page) => page.data);

    return result;
  }, [data]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!data) {
    return (
      <EmptyState title="conversation" description="no conversation found" />
    );
  }
  return (
    <>
      {isDesktop ? (
        <DesktopEmptyChat />
      ) : (
        <>
          <Head>
            <Header>
              <Avatar
                src={
                  profile?.data?.avatar
                    ? profile.data.avatar
                    : "https://i.pravatar.cc/150?u=me"
                }
                size={48}
                online={isConnected}
              />

              <Hi>
                <Hello>{getGreeting(new Date())}!</Hello>
                <Name>{profile?.data?.username}</Name>
              </Hi>

              <IconBtn to={PATHS.SEARCH.SEARCH} aria-label="Search">
                <Search size={20} />
              </IconBtn>
            </Header>
          </Head>

          {conversations?.length !== 0 ? (
            <ChatWrapper>
              <ChatsHeader>
                <ChatsTitle>Chats</ChatsTitle>
              </ChatsHeader>

              <AnimatePresence initial={false}>
                {conversations?.map((c: any) => (
                  <motion.div
                    key={c.id ?? ""}
                    layout
                    exit={{
                      opacity: 0,
                      x: -120,
                      transition: { duration: 0.2 },
                    }}
                  >
                    <Link to={PATHS.CHAT.CHAT(c.id)}>
                      <ConversationCard c={c} />
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ChatWrapper>
          ) : (
            <EmptyState
              title="No conversation Found"
              description="Create a conversation with your friends"
              icon={<EmptyBoxIcon size={24} />}
            />
          )}

          <MobileNav>
            <Fab whileTap={{ scale: 0.92 }} aria-label="New message">
              <Link to={PATHS.CONTACTS.CONTACTlIST}>
                <Plus size={22} />
              </Link>
            </Fab>

            <BottomNav />
          </MobileNav>
        </>
      )}
    </>
  );
};

export default Home;

const ChatWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  overflow: auto;
  position: relative;

  @media (max-width: 767px) {
    padding-bottom: 9rem;
  }
`;

const Head = styled.header`
  width: 100%;
  z-index: 40;
  top: 0;
  left: 0;
  height: auto;
  padding-block: 10px;
  background: ${({ theme }) => theme.colors.background};
  padding-bottom: 4rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;
const Hi = styled.div`
  flex: 1;
`;
const Hello = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const Name = styled.div`
  font-size: 18px;
  font-weight: 700;
`;
const IconBtn = styled(Link)`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textPrimary};
`;
// const Section = styled.div`
//   padding: 16px 0 8px;
// `;
// const SectionTitle = styled.h3`
//   font-size: 13px;
//   color: ${({ theme }) => theme.colors.textSecondary};
//   padding: 0 20px 10px;
//   font-weight: 600;
// `;
// const Stories = styled.div`
//   display: flex;
//   gap: 14px;
//   overflow-x: auto;
//   padding: 4px 20px 16px;
// `;
// const Story = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   gap: 6px;
//   min-width: 64px;
// `;
// const StoryName = styled.span`
//   font-size: 11px;
//   color: ${({ theme }) => theme.colors.textSecondary};
//   max-width: 64px;
//   text-align: center;
//   overflow: hidden;
//   text-overflow: ellipsis;
//   white-space: nowrap;
// `;
// const AddRing = styled.div`
//   width: 56px;
//   height: 56px;
//   border-radius: 50%;
//   background: ${({ theme }) => theme.colors.secondarySoft};
//   color: ${({ theme }) => theme.colors.secondary};
//   display: flex;
//   align-items: center;
//   justify-content: center;
// `;
const ChatsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 20px 12px;
`;
const ChatsTitle = styled.h2`
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
`;
const Fab = styled(motion.button)`
  position: fixed;
  bottom: 99px;
  right: 50%;
  transform: translateX(228px);
  @media (max-width: 460px) {
    right: 20px;
    transform: none;
  }
  width: 50px;
  height: 50px;
  border-radius: 22px;
  background: ${({ theme }) => theme.colors.secondary};
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.orange};
  z-index: 40;
`;
