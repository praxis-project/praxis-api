import { allow, and, not, or, shield } from "graphql-shield";
import { FORBIDDEN } from "../../common/common.constants";
import {
  canApproveGroupMemberRequests,
  canCreateGroupEvents,
  canCreateServerInvites,
  canDeleteGroup,
  canManageEvents,
  canManageGroupEvents,
  canManageGroupPosts,
  canManageGroupRoles,
  canManageGroupSettings,
  canManagePosts,
  canManageServerInvites,
  canManageServerRoles,
  canRemoveMembers,
  canUpdateGroup,
  hasValidRefreshToken,
  isAuthenticated,
  isGroupMember,
  isOwnPost,
  isProposalGroupJoinedByMe,
  isPublicEvent,
  isPublicGroup,
  isPublicGroupPost,
  isPublicGroupProposal,
  isPublicGroupsFeed,
} from "./shield.rules";

export const shieldPermissions = shield(
  {
    Query: {
      isFirstUser: allow,
      users: canRemoveMembers,
      serverInvite: allow,
      serverInvites: or(canCreateServerInvites, canManageServerInvites),
      post: or(isAuthenticated, isPublicGroupPost),
      proposal: or(isAuthenticated, isPublicGroupProposal),
      group: or(isAuthenticated, isPublicGroup),
      event: or(isAuthenticated, isPublicEvent),
      groupRole: isGroupMember,
      publicGroupsFeed: allow,
      publicGroups: allow,
      events: allow,
    },
    Mutation: {
      login: allow,
      logOut: allow,
      signUp: allow,
      refreshToken: and(not(isAuthenticated), hasValidRefreshToken),
      createVote: isProposalGroupJoinedByMe,
      deletePost: or(isOwnPost, canManagePosts, canManageGroupPosts),
      createServerInvite: or(canCreateServerInvites, canManageServerInvites),
      deleteServerInvite: canManageServerInvites,
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
    },
    User: {
      id: or(isAuthenticated, isPublicGroupsFeed),
      name: or(isAuthenticated, isPublicGroupsFeed),
      profilePicture: or(isAuthenticated, isPublicGroupsFeed),
    },
    Image: {
      id: or(isAuthenticated, isPublicGroupsFeed),
    },
    Group: {
      id: or(isAuthenticated, isPublicGroupsFeed),
      name: or(isAuthenticated, isPublicGroupsFeed),
      coverPhoto: or(isAuthenticated, isPublicGroupsFeed),
      roles: isGroupMember,
      memberRequests: canApproveGroupMemberRequests,
      memberRequestCount: canApproveGroupMemberRequests,
    },
    ServerInvite: {
      id: allow,
      token: allow,
    },
    Post: or(isAuthenticated, isPublicGroupPost),
  },
  {
    fallbackRule: isAuthenticated,
    fallbackError: FORBIDDEN,
    allowExternalErrors: true,
  }
);
