import { Link } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Moon, LogOut, ChevronRight, Camera } from "lucide-react";
import { Avatar } from "@/components/app/Avatar";
import { Divider } from "@/components/app/Divider";
import { useThemeStore } from "#/store/theme.store";
import { useAuthStore, useUserProfile } from "@/store/auth.store";
import { PATHS } from "@/lib/paths";
import { useWebSocketStore } from "@/store/websocket.store";
import InstallButton from "#/components/app/installationButton";
import { BottomNav } from "@/components/app/BottomNav";



const Header = styled.header`
  padding: 24px 20px 8px;
`;
const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
`;
const Profile = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: ${({ theme }) => theme.colors.surface};
  margin: 16px 20px;
  padding: 18px;
  border-radius: 24px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;
const PName = styled.div`
  font-weight: 700;
  font-size: 17px;
`;
const PSub = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  margin-top: 2px;
`;
const Card = styled.div`
  margin: 16px 20px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 22px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;
const Item = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  text-align: left;
`;
const IconWrap = styled.div<{ $bg: string; $c: string }>`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: ${({ $bg }) => $bg};
  color: ${({ $c }) => $c};
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;
const Lbl = styled.span`
  flex: 1;
  font-weight: 600;
  font-size: 15px;
`;
const Toggle = styled(motion.button)<{ $on: boolean }>`
  width: 48px;
  height: 28px;
  border-radius: 999px;
  background: ${({ $on, theme }) =>
    $on ? theme.colors.secondary : theme.colors.divider};
  position: relative;
  transition: background 0.2s;
`;
const Knob = styled(motion.span)`
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;
const LogoutBtn = styled.button`
  margin: 8px 20px 32px;
  width: calc(100% - 40px);
  padding: 16px;
  border-radius: 20px;
  background: #ffeeee;
  color: ${({ theme }) => theme.colors.error};
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 7rem;
`;

const Settings =()=> {
  const { mode, toggle } = useThemeStore();
  const dark = mode === "dark";
  // const nav = useNavigate();
  const { logout } = useAuthStore();
  const { profile } = useUserProfile();

  const { disconnect } = useWebSocketStore();

  const handleLogout = () => {
    disconnect();
    logout();
  };

  return (
    <>
      <Header>
        <Title>Settings</Title>
      </Header>
      <Link
        to={PATHS.CHAT.PROFILE}
        style={{ display: "block", color: "inherit", textDecoration: "none" }}
      >
        <Profile>
          <div style={{ position: "relative" }}>
            <Avatar
              src={
                profile?.data.avatar
                  ? profile.data.avatar
                  : "https://i.pravatar.cc/150?u=me"
              }
              size={64}
            />
            <div
              style={{
                position: "absolute",
                right: -2,
                bottom: -2,
                background: "#FF4000",
                color: "#fff",
                width: 24,
                height: 24,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #fff",
              }}
            >
              <Camera size={12} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <PName>{profile?.data.username}</PName>
            <PSub>{profile?.data.email}</PSub>
          </div>
          <ChevronRight color="#B5B5B5" />
        </Profile>
      </Link>

      <Card>
        <Item as="div">
          <IconWrap $bg="#EEF1FF" $c="#5B6CFF">
            <Moon size={18} />
          </IconWrap>
          <Lbl>Dark mode</Lbl>
          <Toggle
            $on={dark}
            onClick={toggle}
            aria-label="Toggle dark mode"
            aria-pressed={dark}
          >
            <Knob
              animate={{ left: dark ? 23 : 3 }}
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
            />
          </Toggle>
        </Item>
        <Divider />
        <InstallButton />
        {/* <Divider />
        <Item>
          <IconWrap $bg="#E0F7EC" $c="#34C759">
            <Lock size={18} />
          </IconWrap>
          <Lbl>Privacy</Lbl>
          <ChevronRight color="#B5B5B5" />
        </Item>
        <Divider />
        <Item>
          <IconWrap $bg="#FFE4EF" $c="#FA549C">
            <Shield size={18} />
          </IconWrap>
          <Lbl>Security</Lbl>
          <ChevronRight color="#B5B5B5" />
        </Item> */}
      </Card>

      {/* <Card>
        <Item>
          <IconWrap $bg="#F0F0F0" $c="#7A7A7A">
            <DownloadCloud size={18} />
          </IconWrap>
          <Lbl>Install app</Lbl>
          <ChevronRight color="#B5B5B5" />
        </Item>
      </Card> */}

      <LogoutBtn onClick={() => handleLogout()}>
        <LogOut size={18} /> Log out
      </LogoutBtn>
      <BottomNav/>
    </>
  );
}

export default Settings
