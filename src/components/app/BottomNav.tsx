import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, Users, Settings } from "lucide-react";
import { PATHS } from "#/lib/paths";

const items = [
  {
    to: `${PATHS.CHAT.HOME}`,
    label: "Messages",
    icon: MessageSquare,
    exact: true,
  },
  // { to: "/app/calls", label: "Calls", icon: Phone, exact: false },
  {
    to: `${PATHS.CONTACTS.CONTACTlIST}`,
    label: "Contacts",
    icon: Users,
    exact: false,
  },
  {
    to: `${PATHS.SETTINGS.SETTING}`,
    label: "Settings",
    icon: Settings,
    exact: false,
  },
] as const;

const Bar = styled.nav`
  position: fixed;
  width: 100%;
  bottom: 0;
  // background: rgba(255, 255, 255, 0.92);
  background: ${({ theme }) => theme.colors.background};
  backdrop-filter: saturate(180%) blur(20px);
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  display: flex;
  justify-content: space-around;
  z-index: 50;
`;
const Item = styled(Link)<{ $active: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  position: relative;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.secondary : theme.colors.textSecondary};
  font-size: 11px;
  font-weight: 600;
  min-height: 56px;
`;
const Indicator = styled(motion.span)`
  position: absolute;
  top: 0;
  width: 28px;
  height: 3px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.secondary};
`;

export function BottomNav() {
  const location = useLocation();
  const pathname = location.pathname;
  return (
    <Bar>
      {items.map(({ to, label, icon: Icon, exact }) => {
        const active = exact ? pathname === to : pathname.startsWith(to);
        return (
          <Item key={to} to={to} $active={active} aria-label={label}>
            {active && (
              <Indicator
                layoutId="navInd"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <Icon size={22} />
            <span>{label}</span>
          </Item>
        );
      })}
    </Bar>
  );
}
