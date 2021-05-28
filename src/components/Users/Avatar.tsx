import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { Avatar } from "@material-ui/core";
import Link from "next/link";

import baseUrl from "../../utils/baseUrl";
import { CURRENT_PROFILE_PICTURE } from "../../apollo/client/queries";
import Messages from "../../utils/messages";

interface Props {
  user: User;
}

const UserAvatar = ({ user }: Props) => {
  const [profilePicture, setProfilePicture] = useState<Image>();

  const profilePictureRes = useQuery(CURRENT_PROFILE_PICTURE, {
    variables: { userId: user.id },
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (profilePictureRes.data)
      setProfilePicture(profilePictureRes.data.currentProfilePicture);
  }, [profilePictureRes.data]);

  return (
    <Link href={`/users/${user.name}`}>
      <a>
        <Avatar
          style={{
            backgroundColor: profilePicture ? "black" : "white",
            color: "black",
          }}
        >
          {profilePicture ? (
            <img
              src={baseUrl + profilePicture.path}
              alt={Messages.images.couldNotRender()}
              style={{
                width: "100%",
              }}
            />
          ) : (
            <>{user.name[0].charAt(0).toUpperCase()}</>
          )}
        </Avatar>
      </a>
    </Link>
  );
};

export default UserAvatar;
