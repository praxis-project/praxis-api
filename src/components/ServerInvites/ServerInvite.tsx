import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import { TableRow, MenuItem } from "@material-ui/core";
import { Assignment } from "@material-ui/icons";

import { DELETE_SERVER_INVITE } from "../../apollo/client/mutations";
import { useUserById } from "../../hooks";
import styles from "../../styles/ServerInvite/ServerInvite.module.scss";
import UserAvatar from "../Users/Avatar";
import TableCell from "../../components/Shared/TableCell";
import { timeFromNow } from "../../utils/time";
import Messages from "../../utils/messages";
import ItemMenu from "../Shared/ItemMenu";
import { ToastStatus } from "../../constants/common";
import { ITEM_TYPE } from "../../constants/serverInvite";
import { toastVar } from "../../apollo/client/localState";

interface Props {
  invite: ServerInvite;
  invites: ServerInvite[];
  setInvites: (invites: ServerInvite[]) => void;
}

const ServerInvite = ({ invite, invites, setInvites }: Props) => {
  const { id, userId, token, uses, maxUses, expiresAt } = invite;
  const user = useUserById(userId);
  const [deleteInvite] = useMutation(DELETE_SERVER_INVITE);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const copyInviteHandler = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/i/${token}`);
    setMenuAnchorEl(null);
    toastVar({
      title: Messages.invites.copiedToClipboard(),
      status: ToastStatus.Success,
    });
  };

  const deleteInviteHandler = async () => {
    await deleteInvite({
      variables: {
        id,
      },
    });
    if (invites)
      setInvites(invites.filter((invite: ServerInvite) => invite.id !== id));
  };

  if (invite && user)
    return (
      <TableRow key={invite.id}>
        <TableCell component="th" scope="row">
          <span className={styles.link}>
            <span className={styles.userAvatar}>
              <UserAvatar user={user} small />
            </span>
            <Link href={`/users/${user.name}`} passHref>
              <a className={styles.userName}>{user.name}</a>
            </Link>
          </span>
        </TableCell>
        <TableCell onClick={copyInviteHandler} style={{ cursor: "pointer" }}>
          {token}
        </TableCell>
        <TableCell>{uses + (maxUses ? `/${maxUses}` : "")}</TableCell>
        <TableCell>
          {expiresAt ? timeFromNow(expiresAt, false) : Messages.time.infinity()}
        </TableCell>
        <TableCell>
          <ItemMenu
            itemId={invite.id}
            itemType={ITEM_TYPE}
            anchorEl={menuAnchorEl}
            setAnchorEl={setMenuAnchorEl}
            deleteItem={deleteInviteHandler}
            ownItem={() => false}
            prependChildren
            hasPermission
          >
            <MenuItem onClick={copyInviteHandler}>
              <Assignment
                fontSize="small"
                style={{
                  marginRight: "5",
                }}
              />
              {Messages.actions.copy()}
            </MenuItem>
          </ItemMenu>
        </TableCell>
      </TableRow>
    );
  return null;
};

export default ServerInvite;
