import { Box, Typography } from '@mui/material';
import { t } from 'i18next';
import { useState } from 'react';
import { Namespace, TFunction } from 'react-i18next';
import { NotificationActionType } from '../../constants/notifications.constants';
import { NavigationPaths } from '../../constants/shared.constants';
import { NotificationFragment } from '../../graphql/notifications/fragments/gen/Notification.gen';
import { useDeleteNotificationMutation } from '../../graphql/notifications/mutations/gen/DeleteNotification.gen';
import { timeAgo } from '../../utils/time.utils';
import Flex from '../Shared/Flex';
import ItemMenu from '../Shared/ItemMenu';
import Link from '../Shared/Link';
import UserAvatar from '../Users/UserAvatar';

interface Props {
  notification: NotificationFragment;
}

const Notification = ({
  notification: { id, actionType, otherUser, proposal, createdAt, __typename },
}: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const [deleteNotification] = useDeleteNotificationMutation();

  const getNotificationMessage = (actionType: string, name?: string) => {
    const _t: TFunction<Namespace<'ns1'>, undefined> = t;

    if (actionType === NotificationActionType.ProposalVote) {
      return _t('notifications.messages.proposalVote', { name });
    }
    if (actionType === NotificationActionType.ProposalComment) {
      return _t('notifications.messages.proposalComment', { name });
    }
    if (actionType === NotificationActionType.PostComment) {
      return _t('notifications.messages.postComment', { name });
    }
    if (actionType === NotificationActionType.PostLike) {
      return _t('notifications.messages.postLike', { name });
    }
    return _t('notifications.errors.invalidType');
  };

  const getPath = () => {
    if (actionType === NotificationActionType.ProposalVote) {
      return `${NavigationPaths.Proposals}/${proposal?.id}`;
    }
    return NavigationPaths.Home;
  };

  const handleDelete = () => {
    deleteNotification({
      variables: { id },
      update(cache) {
        const cacheId = cache.identify({ id, __typename });
        cache.evict({ id: cacheId });
        cache.gc();
      },
    });
  };

  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Link href={getPath()} sx={{ display: 'flex', gap: '10px' }}>
        {otherUser && <UserAvatar user={otherUser} />}
        <Box>
          <Typography
            dangerouslySetInnerHTML={{
              __html: getNotificationMessage(actionType, otherUser?.name),
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {timeAgo(createdAt)}
          </Typography>
        </Box>
      </Link>

      <ItemMenu
        anchorEl={menuAnchorEl}
        deleteItem={handleDelete}
        deletePrompt={t('notifications.prompts.confirmDelete')}
        setAnchorEl={setMenuAnchorEl}
        canDelete
      />
    </Flex>
  );
};

export default Notification;
