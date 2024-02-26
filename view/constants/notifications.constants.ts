export enum NotificationStatus {
  Read = 'read',
  Unread = 'unread',
}

export enum NotificationType {
  AnswerComment = 'answer-comment',
  AnswerLike = 'answer-like',
  CommentLike = 'comment-like',
  Follow = 'follow',
  GroupMemberRequest = 'group-member-request',
  GroupMemberRequestApproval = 'group-member-request-approval',
  PostComment = 'post-comment',
  PostLike = 'post-like',
  ProposalComment = 'proposal-comment',
  ProposalRatification = 'proposal-ratification',
  ProposalVoteAgreement = 'proposal-vote-agreement',
  ProposalVoteBlock = 'proposal-vote-block',
  ProposalVoteReservations = 'proposal-vote-reservations',
  ProposalVoteStandAside = 'proposal-vote-stand-aside',
  QuestionnaireTicketComment = 'questionnaire-ticket-comment',
  QuestionnaireTicketSubmitted = 'questionnaire-ticket-submitted',
  QuestionnaireTicketVoteAgreement = 'questionnaire-ticket-vote-agreement',
  QuestionnaireTicketVoteBlock = 'questionnaire-ticket-vote-block',
  QuestionnaireTicketVoteReservations = 'questionnaire-ticket-vote-reservations',
  QuestionnaireTicketVoteStandAside = 'questionnaire-ticket-vote-stand-aside',
  VerifyUser = 'verify-user',
}
