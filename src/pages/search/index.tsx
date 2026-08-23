import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import styled from "styled-components";
import { ArrowLeft } from "lucide-react";
import { MobileFrame } from "@/components/app/MobileFrame";
import { SearchBar } from "@/components/app/SearchBar";
import { Avatar } from "@/components/app/Avatar";
import { EmptyState } from "@/components/app/EmptyState";
import { Search as SearchIcon } from "lucide-react";
import { useGetConversationsQuery } from "#/hooks/queries/useConversation";
import { useDebounce } from "#/hooks/useDebounce";
import { getConversationBetween } from "#/api/conversation.api";
import { LoadingScreen } from "#/components/app/Loader";

const SearchScreen = () => {
  const [query, setQuery] = useState("");
  const debounceQuery = useDebounce(query, 1000);
  const { data, isLoading } = useGetConversationsQuery("50", debounceQuery);
  const navigate = useNavigate();

  const conversations = useMemo(() => {
    const result = data?.pages.flatMap((page) => page.data);

    return result;
  }, [data]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const handleSearchClick = async (userId: string) => {
    const response = await getConversationBetween(userId);

    if (response.conversation) {
      navigate(`/chat/${response.conversation.id}`);
    } else {
      navigate(`/chat/new/${userId}`);
    }
  };

  return (
    <MobileFrame>
      <Header>
        <Back onClick={() => window.history.back()} aria-label="Back">
          <ArrowLeft size={20} />
        </Back>
        <SearchWrap>
          <SearchBar
            autoFocus
            placeholder="Search people, messages, groups"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </SearchWrap>
      </Header>

      <Wrapper>
        {conversations?.length! <= 0 && (
          <EmptyState
            icon={<SearchIcon size={32} />}
            title="No results found"
            description="Try a different name or keyword."
          />
        )}

        {conversations?.length! > 0 && (
          <Section>
            <SectionTitle>PEOPLE</SectionTitle>
            {conversations?.map((p) => (
              <Row key={p.id} onClick={() => handleSearchClick(p.recipient.id)}>
                <Avatar
                  src={p?.recipient?.avatarUrl ?? ""}
                  size={48}
                  online={p.recipient.isOnline}
                />
                <Meta>
                  <Name>{p.recipient.username}</Name>
                  <Last>{p.lastMessage.message}</Last>
                </Meta>
              </Row>
            ))}
          </Section>
        )}
      </Wrapper>

      {/* {groups.length > 0 && (
        <Section>
          <SectionTitle>GROUP CHATS</SectionTitle>
          {groups.map((p) => (
            <Row key={p.id}>
              <Avatar src={p.avatar} size={48} />
              <Meta>
                <Name>{p.name}</Name>
                <Last>{p.lastMessage}</Last>
              </Meta>
            </Row>
          ))} */}
      {/* </Section> */}
      {/* )} */}
    </MobileFrame>
  );
};

export default SearchScreen;

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  flex: 1;
  height: 100;
  overflow-y: auto;
  padding: 12px;
  padding-bottom: 20px;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
`;
const Back = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;
const SearchWrap = styled.div`
  flex: 1;
`;
const Section = styled.div`
  padding: 8px 0 16px;
`;
const SectionTitle = styled.h3`
  padding: 12px 20px 8px;
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
  letter-spacing: 0.05em;
`;
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 20px;
`;
const Meta = styled.div`
  flex: 1;
  min-width: 0;
`;
const Name = styled.div`
  font-weight: 700;
  font-size: 15px;
`;
const Last = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
