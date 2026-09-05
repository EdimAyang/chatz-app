import styled from "styled-components";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  MessageSquarePlus,
  Settings,
  UserRound,
  //   MessageCircle,
  //   PanelLeftClose,
  //   PanelLeftOpen,
  MessageSquare,
} from "lucide-react";

import { PATHS } from "@/lib/paths";
import { EmptyState } from "./EmptyState";
import { useMemo, useState } from "react";
import { useGetConversationsQuery } from "#/hooks/queries/useConversation";
import { ConversationListSkeleton } from "./Loader";
import { EmptyBoxIcon } from "../icons/emptyBox";
import { Avatar } from "./Avatar";
import { formatTime } from "#/utils/dates";
import { Badge } from "./Badge";
import { useAuthStore, useUserProfile } from "#/store/auth.store";
import { useWebSocketStore } from "#/store/websocket.store";
import { useDebounce } from "#/hooks/useDebounce";
import { getConversationBetween } from "#/api/conversation.api";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuthStore();

  const isActive = (path: string) => pathname === path;

  const [query, setQuery] = useState("");
  const debounceQuery = useDebounce(query, 1000);
  const { data, isLoading } = useGetConversationsQuery(
    "50",
    debounceQuery,
    isAuthenticated,
  );
  const { profile } = useUserProfile();
  const { isConnected } = useWebSocketStore();

  const conversations = useMemo(() => {
    const result = data?.pages.flatMap((page) => page.data);

    return result;
  }, [data]);

  const handleSearchClick = async (userId: string) => {
    const response = await getConversationBetween(userId);

    if (response.conversation) {
      navigate(`/chat/${response.conversation.id}`);
    } else {
      navigate(`/chat/new/${userId}`);
    }
  };

  return (
    <SidebarWrapper>
      {/* LEFT NAVIGATION RAIL */}
      <NavigationRail>
        <Link to={PATHS.CHAT.PROFILE}>
          <Avatar
            space={2}
            src={
              profile?.data?.avatar
                ? profile.data.avatar
                : "https://i.pravatar.cc/150?u=me"
            }
            size={48}
            online={isConnected}
          />
        </Link>
        <RailTop>
          <RailButton
            $active={isActive(PATHS.CHAT.HOME)}
            onClick={() => navigate(PATHS.CHAT.HOME)}
            title="Chats"
          >
            <MessageSquare size={21} />
          </RailButton>

          <RailButton
            $active={isActive(PATHS.CONTACTS.CONTACTlIST)}
            onClick={() => navigate(PATHS.CONTACTS.CONTACTlIST)}
            title="Contacts"
          >
            <UserRound size={21} />
          </RailButton>
        </RailTop>

        <RailBottom>
          <RailButton
            $active={isActive(PATHS.CHAT.PROFILE)}
            onClick={() => navigate(PATHS.CHAT.PROFILE)}
            title="Profile"
          >
            <UserRound size={21} />
          </RailButton>

          <RailButton
            $active={isActive(PATHS.SETTINGS.SETTING)}
            onClick={() => navigate(PATHS.SETTINGS.SETTING)}
            title="Settings"
          >
            <Settings size={21} />
          </RailButton>
        </RailBottom>
      </NavigationRail>

      {/* CONVERSATION SIDEBAR */}
      <ConversationSidebar $collapsed={collapsed}>
        <Header>
          {!collapsed && (
            <Logo onClick={() => navigate(PATHS.CHAT.HOME)}>
              <MessageSquare size={26} strokeWidth={2.4} stroke={"#FF4000"} />
              <LogoText>Chatz</LogoText>
            </Logo>
          )}

          {/* <CollapseButton
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen size={21} />
            ) : (
              <PanelLeftClose size={21} />
            )}
          </CollapseButton> */}
        </Header>

        {/* SEARCH */}
        {!collapsed && (
          <SearchContainer>
            <Search size={19} />

            <SearchInput
              type="search"
              placeholder="Search or start new chat"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <NewChatButton
              onClick={() => navigate(PATHS.CONTACTS.CONTACTlIST)}
              title="New chat"
            >
              <MessageSquarePlus size={19} />
            </NewChatButton>
          </SearchContainer>
        )}

        {/* COLLAPSED SEARCH */}
        {collapsed && (
          <CollapsedSearch onClick={onToggle} title="Search">
            <Search size={20} />
          </CollapsedSearch>
        )}

        {/* CONVERSATIONS */}
        <ConversationSection $collapsed={collapsed}>
          {isLoading && <ConversationListSkeleton />}

          {!collapsed && <SectionTitle>Chats</SectionTitle>}
          {!conversations && (
            <EmptyState
              title="conversation"
              description="no conversation found"
              icon={<EmptyBoxIcon size={24} />}
            />
          )}

          <ConversationList>
            {conversations?.map((item) => (
              <ConversationItem
                key={item.id}
                onClick={() => handleSearchClick(item.recipient.id)}
              >
                {item.recipient.avatarUrl ? (
                  <Avatar
                    src={item.recipient.avatarUrl}
                    alt={item.recipient.username}
                    size={54}
                    online={item.recipient.isOnline}
                    userId={item.recipient.id}
                  />
                ) : (
                  <Initials>
                    {item.recipient.username.charAt(0).toUpperCase()}
                  </Initials>
                )}

                {!collapsed && (
                  <ConversationContent>
                    <ConversationTop>
                      <UserName>{item.recipient.username}</UserName>
                      <Time $unread={item?.unreadCount > 0}>
                        {formatTime(item?.updatedAt ?? "")}
                      </Time>
                    </ConversationTop>

                    <BottomRow>
                      <Last>{item.lastMessage?.message ?? ""}</Last>
                      {item.unreadCount > 0 && (
                        <Badge>{item?.unreadCount}</Badge>
                      )}
                    </BottomRow>
                  </ConversationContent>
                )}
              </ConversationItem>
            ))}
          </ConversationList>
        </ConversationSection>
      </ConversationSidebar>
    </SidebarWrapper>
  );
};

export default Sidebar;

const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;
const Last = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const SidebarWrapper = styled.aside`
  height: 100%;
  display: flex;
  flex-shrink: 0;
  min-width: 0;
`;

const NavigationRail = styled.nav`
  width: 72px;
  height: 100%;
  min-width: 72px;

  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 16px 0;

  background: ${({ theme }) => theme.colors.surface};

  border-right: 1px solid ${({ theme }) => theme.colors.border};

  flex-shrink: 0;
`;

const RailTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RailBottom = styled.div`
  margin-top: auto;

  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RailButton = styled.button<{
  $active: boolean;
}>`
  width: 44px;
  height: 44px;

  display: grid;
  place-items: center;

  border: none;
  border-radius: 12px;

  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : "transparent"};

  color: ${({ $active, theme }) =>
    $active ? "#fff" : theme.colors.textSecondary};

  cursor: pointer;

  transition:
    background 0.2s ease,
    color 0.2s ease;

  &:hover {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.primary : theme.colors.background};

    color: ${({ $active, theme }) =>
      $active ? "#fff" : theme.colors.textPrimary};
  }
`;

const Header = styled.header`
  height: 72px;
  padding: 0 16px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  flex-shrink: 0;
`;

const Logo = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;

  border: none;
  background: transparent;

  color: ${({ theme }) => theme.colors.primary};

  cursor: pointer;
`;

const LogoText = styled.span`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

// const CollapseButton = styled.button`
//   width: 40px;
//   height: 40px;

//   display: grid;
//   place-items: center;

//   border: none;
//   border-radius: 10px;

//   background: transparent;
//   color: ${({ theme }) => theme.colors.textSecondary};

//   cursor: pointer;

//   &:hover {
//     background: ${({ theme }) => theme.colors.surface};
//     color: ${({ theme }) => theme.colors.textPrimary};
//   }
// `;

const ConversationSidebar = styled.section<{
  $collapsed: boolean;
}>`
  height: 100%;

  width: ${({ $collapsed }) => ($collapsed ? "82px" : "300px")};

  max-width: ${({ $collapsed }) => ($collapsed ? "82px" : "300px")};

  min-width: ${({ $collapsed }) => ($collapsed ? "82px" : "300px")};

  display: flex;
  flex-direction: column;

  background: ${({ theme }) => theme.colors.background};

  border-right: 1px solid ${({ theme }) => theme.colors.border};

  transition: width 0.25s ease;

  overflow: hidden;

  flex-shrink: 0;

  @media (max-width: 1023px) {
    width: ${({ $collapsed }) => ($collapsed ? "72px" : "320px")};
  }
`;

const SearchContainer = styled.div`
  height: 46px;
  margin: 0 14px 16px;
  padding: 0 8px 0 14px;

  display: flex;
  align-items: center;
  gap: 10px;

  border-radius: 12px;

  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};

  flex-shrink: 0;
`;

const SearchInput = styled.input`
  min-width: 0;
  flex: 1;

  border: none;
  outline: none;

  background: transparent;

  color: ${({ theme }) => theme.colors.textTertiary};

  font-size: 14px;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const NewChatButton = styled.button`
  width: 34px;
  height: 34px;

  display: grid;
  place-items: center;

  border: none;
  border-radius: 9px;

  background: ${({ theme }) => theme.colors.primary};
  color: white;

  cursor: pointer;
`;

const CollapsedSearch = styled.button`
  width: 42px;
  height: 42px;

  margin: 0 auto 16px;

  display: grid;
  place-items: center;

  border: none;
  border-radius: 10px;

  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};

  cursor: pointer;
`;

const ConversationSection = styled.section<{
  $collapsed: boolean;
}>`
  flex: 1;
  min-height: 0;

  overflow-y: auto;

  padding: ${({ $collapsed }) => ($collapsed ? "4px 8px" : "0 12px 12px")};

  scrollbar-width: thin;
`;

const SectionTitle = styled.h3`
  margin: 0 8px 10px;

  font-size: 13px;
  font-weight: 600;

  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ConversationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ConversationItem = styled.button`
  width: 100%;

  min-height: 64px;

  padding: 8px;

  display: flex;
  align-items: center;
  gap: 12px;

  border: none;
  border-radius: 10px;

  background: transparent;

  cursor: pointer;
  text-align: left;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }
`;

const Initials = styled.div`
  width: 46px;
  height: 46px;

  flex-shrink: 0;

  display: grid;
  place-items: center;

  border-radius: 50%;

  background: ${({ theme }) => theme.colors.primary};
  color: white;

  font-weight: 600;
`;

const ConversationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ConversationTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 8px;
`;

const UserName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  color: ${({ theme }) => theme.colors.textTertiary};

  font-size: 14px;
  font-weight: 600;
`;

const Time = styled.div<{ $unread?: boolean }>`
  font-size: 12px;
  flex-shrink: 0;
  color: ${({ theme, $unread }) =>
    $unread ? theme.colors.secondary : theme.colors.textSecondary};
  font-weight: ${({ $unread }) => ($unread ? 700 : 500)};
`;

// const LastMessage = styled.p`
//   margin: 4px 0 0;

//   overflow: hidden;
//   text-overflow: ellipsis;
//   white-space: nowrap;

//   color: ${({ theme }) => theme.colors.textSecondary};

//   font-size: 13px;
// `;
