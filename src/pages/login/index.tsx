import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Mail, Lock } from "lucide-react";
import { MobileFrame } from "@/components/app/MobileFrame";
import { Button } from "@/components/app/Button";
import { Input } from "@/components/app/Input";
import { PATHS } from "@/lib/paths";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/schema/login.schema";
import { useAuthStore } from "@/store/auth.store";

const Wrap = styled.div`
  flex: 1;
  padding: 28px 24px 32px;
  display: flex;
  flex-direction: column;
`;
const H1 = styled.h1`
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
`;
const Sub = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 8px;
  font-size: 15px;
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 32px;
`;
const Row = styled.div`
  display: flex;
  justify-content: flex-end;
`;
const TextLink = styled(Link)`
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: 600;
  font-size: 14px;
`;
// const Sep = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 12px;
//   margin: 24px 0;
//   &::before,
//   &::after {
//     content: "";
//     flex: 1;
//     height: 1px;
//     background: ${({ theme }) => theme.colors.divider};
//   }
//   color: ${({ theme }) => theme.colors.textTertiary};
//   font-size: 13px;
// `;
const Footer = styled.div`
  text-align: center;
  margin-top: auto;
  padding-top: 24px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;
// const Google = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 12px;
//   background: #fff;
//   border: 1px solid ${({ theme }) => theme.colors.border};
//   border-radius: 20px;
//   height: 58px;
//   font-weight: 600;
//   color: ${({ theme }) => theme.colors.textSecondary};
// `;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    navigate(`${PATHS.CHAT.HOME}`, { replace: true });
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log(data);
    await login.mutateAsync(data);
    navigate(`${PATHS.CHAT.HOME}`, { replace: true });
  };

  return (
    <MobileFrame>
      <Wrap>
        <H1>Welcome back 👋</H1>
        <Sub>Log in to continue your conversations.</Sub>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            icon={<Mail size={18} />}
            {...register("email")}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            placeholder="••••••••"
            icon={<Lock size={18} />}
            toggleVisibility
            {...register("password")}
            error={errors.password?.message}
          />
          <Row>
            <TextLink to="/login">Forgot password?</TextLink>
          </Row>
          <Button full isLoading={login.isPending}>
            Log In
          </Button>
        </Form>
        {/* <Sep>or</Sep> */}
        {/* <Google>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.7 6.4 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.7 6.4 29.1 4.5 24 4.5c-7.4 0-13.8 4.1-17.7 10.2z"
            />
            <path
              fill="#4CAF50"
              d="M24 43.5c5 0 9.6-1.9 13-5l-6-5.1c-2 1.4-4.4 2.2-7 2.2-5.3 0-9.7-3-11.3-7.3l-6.5 5C9.9 39.3 16.4 43.5 24 43.5z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6 5.1c-.4.4 6.7-4.9 6.7-14.5 0-1.2-.1-2.3-.4-3.5z"
            />
          </svg>
          Continue with Google
        </Google> */}
        <Footer>
          Don't have an account? <TextLink to="/register">Sign up</TextLink>
        </Footer>
      </Wrap>
    </MobileFrame>
  );
};

export default Login;
