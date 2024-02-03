import {
  Box,
  Card,
  CardContent,
  CardHeader as MuiCardHeader,
  styled,
} from '@mui/material';
import { MIDDOT_WITH_SPACES } from '../../constants/shared.constants';
import { QuestionnaireTicketCardFragment } from '../../graphql/questions/fragments/gen/QuestionnaireTicketCard.gen';
import { timeAgo } from '../../utils/time.utils';
import Link from '../Shared/Link';
import UserAvatar from '../Users/UserAvatar';
import QuestionnaireTicketCardFooter from './QuestionnaireTicketCardFooter';

const CardHeader = styled(MuiCardHeader)(() => ({
  paddingBottom: 0,
  '& .MuiCardHeader-avatar': {
    marginRight: 11,
  },
  '& .MuiCardHeader-title': {
    fontSize: 15,
  },
}));

interface Props {
  questionnaireTicket: QuestionnaireTicketCardFragment;
}

const QuestionnaireTicketCard = ({ questionnaireTicket }: Props) => {
  const { id, createdAt, user } = questionnaireTicket;
  const questionnaireTicketPath = `/questionnaires/${id}`;
  const formattedDate = timeAgo(createdAt);

  const renderTitle = () => (
    <Link
      href={questionnaireTicketPath}
      sx={{ fontSize: 14, color: 'text.secondary' }}
    >
      <Box component="span">{user.name}</Box>
      {MIDDOT_WITH_SPACES}
      <Box color="inherit" component="span" fontSize={13}>
        {formattedDate}
      </Box>
    </Link>
  );

  return (
    <Card>
      <CardHeader
        avatar={
          <UserAvatar user={user} href={questionnaireTicketPath} withLink />
        }
        title={renderTitle()}
      />
      <CardContent sx={{ '&:last-child': { paddingBottom: 1.5 } }}>
        TODO: Add remaining layout
      </CardContent>

      <QuestionnaireTicketCardFooter
        questionnaireTicket={questionnaireTicket}
      />
    </Card>
  );
};

export default QuestionnaireTicketCard;
