import { Link } from "react-router-dom";
import styled from "styled-components";
import {  MailIcon, User } from "lucide-react";
import { MobileFrame } from "@/components/app/MobileFrame";
import { Button } from "@/components/app/Button";
import { Input } from "@/components/app/Input";
import { PATHS } from "@/lib/paths";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { startSignupSchema, type StartSignupFormData } from "@/schema/start-signup.schema";
import { useStartSignup } from "@/hooks/mutations/useRegister";


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

const StartSignup = () => {
//   const navigate = useNavigate();
  const startSignupMutation = useStartSignup();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StartSignupFormData>({
    resolver: zodResolver(startSignupSchema),
  });

  const onSubmit = async (data: StartSignupFormData) => {
    await startSignupMutation.mutateAsync({
      email: data.email,
      name: data.name,
    });
    // navigate(PATHS.AUTH.COMPLETE_SIGNUP, { replace: true });
  };

  return (
    <MobileFrame>
      <Wrap>
        <H1>Start Signup</H1>
        <Sub>Enter your email and name to get started.</Sub>

        <Form onSubmit={handleSubmit(onSubmit)}>

          <Input
            label="Email"
            placeholder="you@example.com"
            icon={<MailIcon size={18} />}
            {...register("email")}
            error={errors.email?.message}
          />

          <Input
            label="Name"
            placeholder="Your Name"
            icon={<User size={18} />}
            {...register("name")}
            error={errors.name?.message}
          />

          <Button
            full
            style={{ marginTop: 8 }}
            type="submit"
            isLoading={startSignupMutation.isPending}
          >
            Continue
          </Button>
        </Form>

        <Footer>
          Back to <TextLink to={PATHS.AUTH.LOGIN}>Log in</TextLink>
        </Footer>
      </Wrap>
    </MobileFrame>
  );
};

export default StartSignup;
