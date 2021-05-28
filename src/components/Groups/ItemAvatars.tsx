import Link from "next/link";
import UserAvatar from "../Users/Avatar";
import GroupAvatar from "./Avatar";
import styles from "../../styles/Group/ItemAvatars.module.scss";
import { Common, Motions } from "../../constants";
import Messages from "../../utils/messages";

interface Props {
  user: User;
  group: Group;
  motion?: Motion;
}

const GroupItemAvatars = ({ user, group, motion }: Props) => {
  if (user && group)
    return (
      <div className={styles.avatars}>
        <div className={styles.avatarLinks}>
          <GroupAvatar group={group} />
          {user && (
            <div className={styles.avatarSmall}>
              <UserAvatar user={user} />
            </div>
          )}
        </div>
        <div className={styles.groupPostLinks}>
          <Link href={`/groups/${group.name}`}>
            <a className={styles.groupNameLink}>{group.name}</a>
          </Link>
          <Link href={motion ? `/motions/${motion.id}` : `/users/${user.name}`}>
            <a className={styles.postByLink}>
              {Messages.groups.itemWithNameAndRatified(
                motion ? Common.ModelNames.Motion : Common.ModelNames.Post,
                user.name,
                motion?.stage === Motions.Stages.Ratified
              )}
            </a>
          </Link>
        </div>
      </div>
    );
  return <></>;
};

export default GroupItemAvatars;
