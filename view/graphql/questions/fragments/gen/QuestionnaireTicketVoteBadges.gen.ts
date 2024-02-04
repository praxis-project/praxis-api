import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { VoteFragmentDoc } from '../../../votes/fragments/gen/Vote.gen';
import { VoteBadgeFragmentDoc } from '../../../votes/fragments/gen/VoteBadge.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type QuestionnaireTicketVoteBadgesFragment = {
  __typename?: 'QuestionnaireTicket';
  id: number;
  settings: {
    __typename?: 'QuestionnaireTicketConfig';
    id: number;
    decisionMakingModel: string;
  };
  votes: Array<{
    __typename?: 'Vote';
    id: number;
    voteType: string;
    user: {
      __typename?: 'User';
      id: number;
      name: string;
      profilePicture: { __typename?: 'Image'; id: number };
    };
  }>;
};

export const QuestionnaireTicketVoteBadgesFragmentDoc = gql`
  fragment QuestionnaireTicketVoteBadges on QuestionnaireTicket {
    id
    settings {
      id
      decisionMakingModel
    }
    votes {
      ...Vote
      ...VoteBadge
    }
  }
  ${VoteFragmentDoc}
  ${VoteBadgeFragmentDoc}
`;
