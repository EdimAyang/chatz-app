import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { LoaderCircle, Mail } from "lucide-react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import { useState } from "react";
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

const ReminderOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
`;

const ReminderDialog = styled.div`
  width: min(100%, 380px);
  padding: 24px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  animation: reminderDialogIn 0.2s ease-out;

  @keyframes reminderDialogIn {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.97);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const ReminderTitle = styled.h2`
  margin: 0 0 8px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 18px;
  font-weight: 600;
`;

const ReminderText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.5;
`;

const ReminderActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
`;

const ReminderCancelButton = styled.button`
  min-width: 90px;
  padding: 10px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }
`;

const ReminderSubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 130px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.secondary};
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.6;
  }
`;

const submitSpinner = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const ReminderSpinner = styled(LoaderCircle)`
  animation: ${submitSpinner} 0.8s linear infinite;
`;

const ForgotPassword = () => {
  const [reminderOpen, setReminderOpen] = useState(false);
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
    setReminderOpen(false);
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    const submitter = (event.nativeEvent as SubmitEvent).submitter;

    if ((submitter as HTMLElement | null)?.id !== "forgot-password-confirm") {
      event.preventDefault();
      void handleSubmit(() => setReminderOpen(true))();
      return;
    }

    void handleSubmit(onSubmit)(event);
  };

  return (
    <MobileFrame>
      <Wrap>
        <H1>Forgot password?</H1>
        <Sub>We’ll send a reset link to your email.</Sub>

        <Form id="forgot-password-form" onSubmit={handleFormSubmit}>
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
            type="button"
            onClick={() => void handleSubmit(() => setReminderOpen(true))()}
            disabled={forgotPasswordMutation.isPending}
          >
            Send reset link
          </Button>
        </Form>

        <Footer>
          Remembered your password?{" "}
          <TextLink to={PATHS.AUTH.LOGIN}>Log in</TextLink>
        </Footer>
      </Wrap>
      {reminderOpen &&
        createPortal(
          <ReminderOverlay onClick={() => setReminderOpen(false)}>
            <ReminderDialog
              role="dialog"
              aria-modal="true"
              aria-labelledby="email-reminder-title"
              onClick={(event) => event.stopPropagation()}
            >
              <ReminderTitle id="email-reminder-title">
                Check your email
              </ReminderTitle>
              <ReminderText>
                If the password reset email isn’t in your inbox, check your
                spam or junk folder.
              </ReminderText>
              <ReminderActions>
                <ReminderCancelButton
                  type="button"
                  onClick={() => setReminderOpen(false)}
                  disabled={forgotPasswordMutation.isPending}
                >
                  Cancel
                </ReminderCancelButton>
                <ReminderSubmitButton
                  id="forgot-password-confirm"
                  type="submit"
                  form="forgot-password-form"
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending ? (
                    <>
                      <ReminderSpinner size={16} aria-label="Sending" />
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </ReminderSubmitButton>
              </ReminderActions>
            </ReminderDialog>
          </ReminderOverlay>,
          document.body,
        )}
    </MobileFrame>
  );
};

export default ForgotPassword;
