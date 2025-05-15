import { account } from "@lens-protocol/metadata";

export function buildAccountMetadata({ name, profilePhoto, coverPhoto, bio }: {
  name: string;
  profilePhoto?: string;
  coverPhoto?: string;
  bio?: string;
}) {
  return account({
    name,
    bio,
    coverPicture: coverPhoto,
    picture: profilePhoto,
  });
}
