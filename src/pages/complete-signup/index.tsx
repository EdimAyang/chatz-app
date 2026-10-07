import { Link, useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { Lock } from "lucide-react";
import { MobileFrame } from "@/components/app/MobileFrame";
import { Button } from "@/components/app/Button";
import { Input } from "@/components/app/Input";
import { PATHS } from "@/lib/paths";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  completeSignupSchema,
  type CompleteSignupFormData,
} from "@/schema/complete-signup.schema";
import { useCompleteSignup } from "#/hooks/mutations/useRegister";


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

const CompleteSignupPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const completeSignupMutation = useCompleteSignup();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompleteSignupFormData>({
    resolver: zodResolver(completeSignupSchema),
  });

  const onSubmit = async (data: CompleteSignupFormData) => {
    await completeSignupMutation.mutateAsync({
      token: token || "",
      password: data.password,
      confirmPassword: data.confirmPassword,
    });
    navigate(PATHS.CHAT.HOME, { replace: true });
  };

  return (
    <MobileFrame>
      <Wrap>
        <H1>Complete Signup</H1>
        <Sub>Almost done!</Sub>

        <Form onSubmit={handleSubmit(onSubmit)}>

          <Input
            label="password"
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

          <Button
            full
            style={{ marginTop: 8 }}
            type="submit"
            isLoading={completeSignupMutation.isPending}
          >
            Complete signup
          </Button>
        </Form>

        <Footer>
          Back to <TextLink to={PATHS.AUTH.LOGIN}>Log in</TextLink>
        </Footer>
      </Wrap>
    </MobileFrame>
  );
};

export default CompleteSignupPage;
