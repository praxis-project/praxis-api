import { allow, and, or, shield } from 'graphql-shield';
import { FORBIDDEN } from '../common/common.constants';
import { isAuthenticated } from './rules/auth.rules';
import {
  canManageComments,
  isOwnComment,
  isPublicComment,
  isPublicCommentImage,
} from './rules/comment.rules';
import {
  canManageEvents,
  isPublicEvent,
  isPublicEventImage,
  isPublicEventPost,
} from './rules/event.rules';
import {
  canApproveGroupMemberRequests,
  canCreateGroupEvents,
  canDeleteGroup,
  canManageGroupComments,
  canManageGroupEvents,
  canManageGroupPosts,
  canManageGroupRoles,
  canManageGroupSettings,
  canUpdateGroup,
  isGroupMember,
  isProposalGroupJoinedByMe,
  isPublicGroup,
  isPublicGroupImage,
  isPublicGroupRole,
} from './rules/group.rules';
import { isPublicLike } from './rules/like.rules';
import { isOwnNotification } from './rules/notification.rules';
import {
  canManagePosts,
  isOwnPost,
  isPublicPost,
  isPublicPostImage,
} from './rules/post.rules';
import {
  canRemoveProposals,
  hasNoVotes,
  isOwnProposal,
  isPublicProposal,
  isPublicProposalAction,
  isPublicProposalImage,
  isPublicProposalVote,
} from './rules/proposal.rules';
import { canManageQuestionnaireTickets } from './rules/question.rules';
import { canManageServerRoles } from './rules/role.rules';
import { canManageRules, isPublicRule } from './rules/rule.rules';
import { canManageServerSettings } from './rules/server-config.rules';
import {
  canCreateServerInvites,
  canManageServerInvites,
} from './rules/server-invite.rules';
import {
  canRemoveMembers,
  isPublicUserAvatar,
  isUserInPublicGroups,
} from './rules/user.rules';

export const shieldPermissions = shield(
  {
    Query: {
      isFirstUser: allow,
      users: canRemoveMembers,
      serverInvite: allow,
      serverInvites: or(canCreateServerInvites, canManageServerInvites),
      serverConfig: canManageServerSettings,
      post: or(isAuthenticated, isPublicPost, isPublicEventPost),
      proposal: or(isAuthenticated, isPublicProposal),
      group: or(isAuthenticated, isPublicGroup),
      event: or(isAuthenticated, isPublicEvent),
      groupRole: isGroupMember,
      publicGroupsFeed: allow,
      publicGroups: allow,
      publicGroupsCount: allow,
      publicCanary: allow,
      serverRules: allow,
      events: allow,
      likes: or(
        isAuthenticated,
        isPublicComment,
        isPublicEventPost,
        isPublicPost,
      ),
    },
    Mutation: {
      login: allow,
      logOut: allow,
      signUp: allow,
      updatePost: isOwnPost,
      deletePost: or(isOwnPost, canManagePosts, canManageGroupPosts),
      deleteProposal: or(and(isOwnProposal, hasNoVotes), canRemoveProposals),
      createVote: or(isProposalGroupJoinedByMe, canManageQuestionnaireTickets),
      createServerInvite: or(canCreateServerInvites, canManageServerInvites),
      deleteServerInvite: canManageServerInvites,
      updateServerConfig: canManageServerSettings,
      createServerRole: canManageServerRoles,
      updateServerRole: canManageServerRoles,
      deleteServerRole: canManageServerRoles,
      deleteServerRoleMember: canManageServerRoles,
      approveGroupMemberRequest: canApproveGroupMemberRequests,
      updateGroupConfig: canManageGroupSettings,
      updateGroup: canUpdateGroup,
      deleteGroup: canDeleteGroup,
      createGroupRole: canManageGroupRoles,
      updateGroupRole: canManageGroupRoles,
      deleteGroupRole: canManageGroupRoles,
      deleteGroupRoleMember: canManageGroupRoles,
      createEvent: or(canCreateGroupEvents, canManageGroupEvents),
      deleteEvent: or(canManageEvents, canManageGroupEvents),
      updateEvent: or(canManageEvents, canManageGroupEvents),
      createRule: canManageRules,
      deleteRule: canManageRules,
      updateRule: canManageRules,
      updateRulesPriority: canManageRules,
      updateNotification: isOwnNotification,
      deleteNotification: isOwnNotification,
      updateComment: isOwnComment,
      deleteComment: or(
        isOwnComment,
        canManageComments,
        canManageGroupComments,
      ),
    },
    User: {
      id: or(isAuthenticated, isUserInPublicGroups),
      name: or(isAuthenticated, isUserInPublicGroups),
      profilePicture: or(isAuthenticated, isUserInPublicGroups),
    },
    Group: {
      id: or(isAuthenticated, isPublicGroup),
      name: or(isAuthenticated, isPublicGroup),
      description: or(isAuthenticated, isPublicGroup),
      coverPhoto: or(isAuthenticated, isPublicGroup),
      settings: or(isAuthenticated, isPublicGroup),
      feed: or(isAuthenticated, isPublicGroup),
      feedCount: or(isAuthenticated, isPublicGroup),
      futureEvents: or(isAuthenticated, isPublicGroup),
      pastEvents: or(isAuthenticated, isPublicGroup),
      memberCount: or(isAuthenticated, isPublicGroup),
      memberRequests: canApproveGroupMemberRequests,
      memberRequestCount: canApproveGroupMemberRequests,
      roles: isGroupMember,
    },
    GroupConfig: or(isAuthenticated, isPublicGroup),
    GroupRole: {
      id: or(isAuthenticated, isPublicGroupRole),
      name: or(isAuthenticated, isPublicGroupRole),
      color: or(isAuthenticated, isPublicGroupRole),
    },
    FeedItemsConnection: or(
      isAuthenticated,
      isPublicEventPost,
      isPublicProposal,
      isPublicPost,
    ),
    PublicFeedItemsConnection: allow,
    Image: {
      id: or(
        isAuthenticated,
        isPublicCommentImage,
        isPublicEventImage,
        isPublicGroupImage,
        isPublicPostImage,
        isPublicProposalImage,
        isPublicUserAvatar,
      ),
      filename: or(
        isAuthenticated,
        isPublicCommentImage,
        isPublicPostImage,
        isPublicProposalImage,
      ),
    },
    ServerInvite: {
      id: allow,
      token: allow,
    },
    Canary: {
      id: allow,
      statement: allow,
      updatedAt: allow,
    },
    AuthPayload: {
      access_token: allow,
    },
    Rule: or(isAuthenticated, isPublicRule),
    Event: or(isAuthenticated, isPublicEvent),
    Post: or(isAuthenticated, isPublicPost, isPublicEventPost),
    Like: or(isAuthenticated, isPublicLike),
    Comment: or(isAuthenticated, isPublicComment),
    Proposal: or(isAuthenticated, isPublicProposal),
    ProposalConfig: or(isAuthenticated, isPublicProposal),
    ProposalAction: or(isAuthenticated, isPublicProposalAction),
    ProposalActionEvent: or(isAuthenticated, isPublicProposalAction),
    ProposalActionEventHost: or(isAuthenticated, isPublicProposalAction),
    ProposalActionPermission: or(isAuthenticated, isPublicProposalAction),
    ProposalActionRole: or(isAuthenticated, isPublicProposalAction),
    ProposalActionRoleMember: or(isAuthenticated, isPublicProposalAction),
    ProposalActionGroupConfig: or(isAuthenticated, isPublicProposalAction),
    Vote: or(isAuthenticated, isPublicProposalVote),
  },
  {
    fallbackRule: isAuthenticated,
    fallbackError: FORBIDDEN,
    allowExternalErrors: true,
  },
);
