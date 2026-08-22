import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Mail, Lock, User } from "lucide-react";
import { MobileFrame } from "@/components/app/MobileFrame";
import { Button } from "@/components/app/Button";
import { Input } from "@/components/app/Input";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  type RegisterFormData,
} from "@/schema/register.schema";
import { PATHS } from "@/lib/paths";

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
const Footer = styled.div`
  text-align: center;
  margin-top: auto;
  padding-top: 24px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;
const TextLink = styled(Link)`
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: 600;
`;

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async ({ confirmPassword, ...data }: RegisterFormData) => {
    await signUp.mutateAsync(data);
    navigate(`${PATHS.CHAT.HOME}`, { replace: true });
  };

  return (
    <MobileFrame>
      <Wrap>
        <H1>Create account ✨</H1>
        <Sub>Join Chatz in a few seconds.</Sub>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Full name"
            placeholder="Sophia Carter"
            {...register("name")}
            icon={<User size={18} />}
            error={errors.name?.message}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            icon={<Mail size={18} />}
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
          <Input
            label="Confirm password"
            placeholder="••••••••"
            icon={<Lock size={18} />}
            toggleVisibility
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />
          <Button full style={{ marginTop: 8 }} isLoading={signUp.isPending}>
            Create Account
          </Button>
        </Form>
        <Footer>
          Already have an account? <TextLink to="/login">Log in</TextLink>
        </Footer>
      </Wrap>
    </MobileFrame>
  );
};


export default Register