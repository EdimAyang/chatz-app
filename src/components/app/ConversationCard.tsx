import styled from "styled-components";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { formatTime } from "@/utils/dates";
import { PATHS } from "#/lib/paths";

interface CardType {
  id: string;
  isGroup: boolean;
  recipient: {
    id: string;
    username: string;
    avatarUrl: string | null;
    bio: string | null;
    isOnline: boolean;
    lastSeen: string;
  };
  lastMessage: {
    id: string;
    message: string | null;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string | null;
}

export function ConversationCard({
  c,
  onDelete,
}: {
  c: CardType;
  onDelete?: (id: string) => void;
}) {
  const x = useMotionValue(0);
  const bgOpacity = useTransform(x, [-120, -40, 0], [1, 0.7, 0]);

  console.log(c);
  return (
    <Outer>
      <motion.div
        style={{ position: "absolute", inset: 0, opacity: bgOpacity }}
      >
        <DeleteBg>
          <button
            type="button"
            onClick={() => onDelete?.(c.id)}
            style={{
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 600,
            }}
            aria-label="Delete conversation"
          >
            <Trash2 size={20} /> Delete
          </button>
        </DeleteBg>
      </motion.div>
      <Card
        drag="x"
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.1}
        style={{ x }}
        whileTap={{ backgroundColor: "#fafafa" }}
      >
        <Link
          to={PATHS.CHAT.CHAT(c.id)}
          style={{
            display: "flex",
            gap: 14,
            alignItems: "center",
            flex: 1,
            minWidth: 0,
            color: "inherit",
            textDecoration: "none",
          }}
        >
          <Avatar
            src={c?.recipient.avatarUrl ?? ""}
            alt={c?.recipient.username.charAt(0)}
            size={54}
            online={c?.recipient.isOnline}
            userId={c?.recipient.id}
          />
          <Meta>
            <TopRow>
              <Name>{c?.recipient.username}</Name>
              <Time $unread={c?.unreadCount > 0}>
                {formatTime(c?.updatedAt ?? "")}
              </Time>
            </TopRow>
            <BottomRow>
              <Last>{c.lastMessage?.message ?? ""}</Last>
              {c.unreadCount > 0 && <Badge>{c?.unreadCount}</Badge>}
            </BottomRow>
          </Meta>
        </Link>
      </Card>
    </Outer>
  );
}

export { AnimatePresence };

const Outer = styled.div`
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};
`;
const DeleteBg = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 28px;
  background: ${({ theme }) => theme.colors.error};
  color: #fff;
`;
const Card = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 20px;
  background: ${({ theme }) => theme.colors.background};
`;
const Meta = styled.div`
  flex: 1;
  min-width: 0;
`;
const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
`;
const Name = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const Time = styled.div<{ $unread?: boolean }>`
  font-size: 12px;
  flex-shrink: 0;
  color: ${({ theme, $unread }) =>
    $unread ? theme.colors.secondary : theme.colors.textSecondary};
  font-weight: ${({ $unread }) => ($unread ? 700 : 500)};
`;
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
