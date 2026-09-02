import { Link } from "react-router-dom";
import styled from "styled-components";
import { Mail } from "lucide-react";
import { MobileFrame } from "@/components/app/MobileFrame";
import { Button } from "@/components/app/Button";
import { Input } from "@/components/app/Input";
import { PATHS } from "@/lib/paths";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/schema/forgot-password.schema";
import { useForgotPassword } from "@/hooks/mutations/useForgortPassword";

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

const ForgotPassword = () => {
  // const navigate = useNavigate();
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    await forgotPasswordMutation.mutateAsync(data.email);
    // navigate(PATHS.AUTH.RESET_PASSWORD, { replace: true });
  };

  return (
    <MobileFrame>
      <Wrap>
        <H1>Forgot password?</H1>
        <Sub>We’ll send a reset link to your email.</Sub>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            icon={<Mail size={18} />}
            {...register("email")}
            error={errors.email?.message}
          />

          <Button
            full
            style={{ marginTop: 8 }}
            type="submit"
            isLoading={forgotPasswordMutation.isPending}
          >
            Send reset link
          </Button>
        </Form>

        <Footer>
          Remembered your password?{" "}
          <TextLink to={PATHS.AUTH.LOGIN}>Log in</TextLink>
        </Footer>
      </Wrap>
    </MobileFrame>
  );
};

export default ForgotPassword;
