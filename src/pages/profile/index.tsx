import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import {
  ArrowLeft,
  Camera,
  Mail,
  Phone,
  AtSign,
  // MapPin,
  Pencil,
  // Check,
  // MessageSquareCodeIcon,
  // MessageSquareIcon,
  // PhoneIcon,
  // VideoIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/app/Avatar";
import { Divider } from "@/components/app/Divider";
import { Button } from "@/components/app/Button";
import { BottomSheet } from "@/components/app/BottomSheet";
import { Input } from "@/components/app/Input";
import { useUserProfile } from "@/store/auth.store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileSchema, type ProfileFormData } from "@/schema/profile.schema";
import {
  useUpdateProfile,
  useUpdateProfileAvatar,
} from "@/hooks/mutations/useUpdateProfile";
import toast from "react-hot-toast";

type FieldKey = "username" | "email" | "phone";

const Profile = () => {
  const [editing, setEditing] = useState(false);
  const { profile } = useUserProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const values = {
    username: profile?.data?.username || "@alexmorgan",
    email: profile?.data?.email || "alex.morgan@messageme.app",
    phone: profile?.data?.phoneNumber || "+1 (415) 555-0117",
    // location: profile?.data?.location || "San Francisco, CA",
    bio:
      profile?.data?.bio ||
      "Hey there! I'm using MessageMe. Let's chat and stay connected!",
  };

  const fields: { key: FieldKey; label: string; icon: React.ReactNode }[] = [
    { key: "username", label: "Username", icon: <AtSign size={18} /> },
    { key: "email", label: "Email", icon: <Mail size={18} /> },
    { key: "phone", label: "Phone", icon: <Phone size={18} /> },
    // { key: "location", label: "Location", icon: <MapPin size={18} /> },
  ];

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
  });

  const updateProfileMutation = useUpdateProfile();
  const updateProfileAvatarMutation = useUpdateProfileAvatar();

  const onSubmit = (data: ProfileFormData) => {
    try {
      updateProfileMutation.mutate(data);
      if (updateProfileMutation.isSuccess) {
        reset();
        setEditing(false);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      reset();
      setEditing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }

    setSelectedImage(file);
  };

  useEffect(() => {
    if (!selectedImage) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImage]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const uploadAvatar = async () => {
    const formData = new FormData();
    if (selectedImage) {
      formData.append("avatar", selectedImage);
    }
    try {
      await updateProfileAvatarMutation.mutateAsync(formData);
    } finally {
      setSelectedImage(null);
      setPreview(null);
    }
  };

  return (
    <>
      <Header>
        <Back onClick={() => window.history.back()} aria-label="Back">
          <ArrowLeft size={20} />
        </Back>
        <Title>Profile</Title>
      </Header>

      <Hero>
        <AvatarWrap>
          <Avatar
            src={
              preview
                ? preview
                : profile?.data.avatar
                  ? profile.data.avatar
                  : "https://i.pravatar.cc/200?u=me"
            }
            size={104}
          />
          <CamBtn
            whileTap={{ scale: 0.9 }}
            aria-label="Change photo"
            onClick={openFilePicker}
          >
            <Camera size={16} />
          </CamBtn>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
        </AvatarWrap>
        <Name>{values.username}</Name>
        <Bio>{values.bio}</Bio>
      </Hero>

      {/* <Stats>
        <Stat>
          <StatN>
            <Icon>
              <MessageSquareIcon size={24} />
            </Icon>
          </StatN>
          <StatL>Message</StatL>
        </Stat>
        <Stat>
          <StatN>
            <Icon>
              <PhoneIcon size={24} />
            </Icon>
          </StatN>
          <StatL>Voice call</StatL>
        </Stat>
        <Stat>
          <StatN>
            <Icon>
              <VideoIcon size={24} />
            </Icon>
          </StatN>
          <StatL>Video call</StatL>
        </Stat>
      </Stats> */}

      <Card>
        {fields.map((f, i) => (
          <div key={f.key}>
            <Field>
              <Icon>{f.icon}</Icon>
              <FieldInfo>
                <FieldLabel>{f.label}</FieldLabel>
                <FieldValue>{values[f.key]}</FieldValue>
              </FieldInfo>
            </Field>
            {i < fields.length - 1 && <Divider />}
          </div>
        ))}
      </Card>

      <Actions>
        <Button
          full
          variant="secondary"
          onClick={() => {
            if (preview) {
              uploadAvatar();
            } else {
              setEditing(true);
            }
          }}
          isLoading={updateProfileAvatarMutation.isPending}
        >
          <Pencil size={16} />
          {updateProfileAvatarMutation.isPending ? "updating" : " Edit profile"}
        </Button>
      </Actions>

      {editing && (
        <BottomSheet open={editing} onClose={() => setEditing(false)}>
          <ProfileForm onSubmit={handleSubmit(onSubmit)}>
            <Input
              placeholder="username"
              {...register("username")}
              icon={<Pencil size={18} />}
              error={errors.username?.message}
            />

            <Input
              placeholder="phone"
              {...register("phoneNumber")}
              icon={<Pencil size={18} />}
              error={errors.phoneNumber?.message}
            />

            <BioInput
              placeholder="Bio"
              rows={3}
              {...register("bio")}
              maxLength={150}
            />
            <Button full isLoading={updateProfileMutation.isPending}>
              Save changes
            </Button>
          </ProfileForm>
        </BottomSheet>
      )}
    </>
  );
};

export default Profile;

const ProfileForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 32px;
`;

const BioInput = styled.textarea`
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-weight: 600;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textPrimary};
  resize: none;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 16px 8px;
`;
const Back = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const Title = styled.h1`
  flex: 1;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  margin-right: 40px;
`;

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 20px 8px;
  gap: 14px;
`;
const AvatarWrap = styled.div`
  position: relative;
`;
const CamBtn = styled(motion.button)`
  position: absolute;
  right: -4px;
  bottom: -4px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.secondary};
  color: #fff;
  border: 3px solid ${({ theme }) => theme.colors.background};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.orange};
`;
const Name = styled.h2`
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
`;
const Bio = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  text-align: center;
  max-width: 280px;
  line-height: 1.5;
`;

// const Stats = styled.div`
//   display: grid;
//   grid-template-columns: repeat(3, 1fr);
//   gap: 12px;
//   margin: 20px 20px 8px;
// `;
// const Stat = styled.div`
//   background: ${({ theme }) => theme.colors.surface};
//   padding: 14px;
//   border-radius: 18px;
//   text-align: center;
//   box-shadow: ${({ theme }) => theme.shadows.sm};
// `;
// const StatN = styled.div`
//   font-size: 20px;
//   font-weight: 800;
//   color: ${({ theme }) => theme.colors.textPrimary};
// `;
// const StatL = styled.div`
//   font-size: 12px;
//   color: ${({ theme }) => theme.colors.textSecondary};
//   margin-top: 4px;
// `;

const Card = styled.div`
  margin: 16px 20px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 22px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;
const Field = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
`;
const Icon = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.secondarySoft};
  color: ${({ theme }) => theme.colors.secondary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;
const FieldInfo = styled.div`
  flex: 1;
  min-width: 0;
`;
const FieldLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 2px;
`;
const FieldValue = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textPrimary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
// const FieldInput = styled.input`
//   width: 100%;
//   border: none;
//   outline: none;
//   background: transparent;
//   font-family: inherit;
//   font-weight: 600;
//   font-size: 15px;
//   color: ${({ theme }) => theme.colors.textPrimary};
// `;

const Actions = styled.div`
  padding: 8px 20px 32px;
  margin-bottom: 5rem;
`;
