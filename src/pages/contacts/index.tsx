import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import styled from "styled-components";
// import { UserPlus } from "lucide-react";
import { SearchBar } from "@/components/app/SearchBar";
import { Avatar } from "@/components/app/Avatar";
import { useGetUsersQuery } from "#/hooks/queries/useUsers";
import { createConversation } from "#/api/conversation.api";
import { UserListSkeleton } from "#/components/app/Loader";
// import { Button } from "#/components/app/Button";
import { BottomNav } from "@/components/app/BottomNav";
import { MobileNav } from "#/layouts/appLayouts";

const Contacts = () => {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const { data, isLoading } = useGetUsersQuery("10");

  const contacts = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const groups = useMemo(() => {
    const filtered = contacts?.filter((c) =>
      c.username.toLowerCase().includes(q.toLowerCase()),
    );
    const m = new Map<string, typeof contacts>();
    filtered.forEach((c) => {
      const k = c.username[0].toUpperCase();
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(c);
    });
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [q, contacts]);

  if (isLoading) {
    return (
      <>
        <Header>
          <Title>Contacts</Title>
          <SearchBar
            placeholder="Search contacts"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </Header>

        <Wrapper>
          <UserListSkeleton />
        </Wrapper>
      </>
    );
  }

  const handleContactClick = async (userId: string) => {
    // const response = await getConversationBetween(userId);
    const response = await createConversation(userId);

    if (response.conversation) {
      navigate(`/chat/${response.conversation.id}`);
    } else {
      navigate(`/chat/new/${userId}`);
    }
  };

  return (
    <>
      <Header>
        <Title>Contacts</Title>
        <SearchBar
          placeholder="Search contacts"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </Header>

      {/* <Invite>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FF4000",
          }}
        >
          <UserPlus size={22} />
        </div>
        <InviteTxt>
          <InviteH>Invite friends</InviteH>
          <InviteS>Get $5 credit per friend who joins.</InviteS>
        </InviteTxt>
        <Button size="sm" variant="primary">
          Invite
        </Button>
      </Invite> */}

      <Wrapper>
        {groups.map(([letter, items]) => (
          <Group key={letter}>
            <Letter>{letter}</Letter>
            {items.map((c) => (
              <Row key={c.id} onClick={() => handleContactClick(c.id)}>
                <Avatar
                  src={c?.avatarUrl ?? ""}
                  size={44}
                  online={c.isOnline}
                  userId={c.id}
                />
                <Name>{c.username}</Name>
                {c.isOnline && <Online>Online</Online>}
              </Row>
            ))}
          </Group>
        ))}
      </Wrapper>
      <MobileNav>
        <BottomNav />
      </MobileNav>
    </>
  );
};

export default Contacts;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px;
  padding-bottom: 80px;
`;

const Header = styled.header`
  padding: 24px 20px 12px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
`;
const Group = styled.div`
  padding: 8px 0;
`;
const Letter = styled.div`
  padding: 6px 20px;
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.secondary};
`;
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 20px;
`;
const Name = styled.div`
  flex: 1;
  font-size: 15px;
  font-weight: 600;
`;
const Online = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.success};
`;

// const Invite = styled.div`
//   margin: 20px;
//   padding: 20px;
//   background: ${({ theme }) => theme.colors.secondarySoft};
//   border-radius: 22px;
//   display: flex;
//   align-items: center;
//   gap: 14px;
// `;
// const InviteTxt = styled.div`
//   flex: 1;
// `;
// const InviteH = styled.div`
//   font-weight: 700;
//   font-size: 15px;
// `;
// const InviteS = styled.div`
//   font-size: 13px;
//   color: ${({ theme }) => theme.colors.textSecondary};
//   margin-top: 2px;
// `;
