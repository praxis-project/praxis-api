import { Injectable } from "@nestjs/common";
import { AuthTokens } from "../auth/auth.service";
import { Claims, decodeToken, getSub } from "../auth/auth.utils";
import { RefreshTokensService } from "../auth/refresh-tokens/refresh-tokens.service";
import { DataloaderService } from "../dataloader/dataloader.service";
import { EventsService } from "../events/events.service";
import { GroupMemberRequestsService } from "../groups/group-member-requests/group-member-requests.service";
import { GroupRolesService } from "../groups/group-roles/group-roles.service";
import { GroupsService } from "../groups/groups.service";
import { ImagesService } from "../images/images.service";
import { PostsService } from "../posts/posts.service";
import { ProposalActionRolesService } from "../proposals/proposal-actions/proposal-action-roles/proposal-action-roles.service";
import { ProposalActionsService } from "../proposals/proposal-actions/proposal-actions.service";
import { ProposalsService } from "../proposals/proposals.service";
import { ShieldService } from "../shield/shield.service";
import { UsersService } from "../users/users.service";
import { Context, ContextServices } from "./context.types";

interface RequestWithCookies extends Request {
  cookies?: { auth?: AuthTokens };
}

@Injectable()
export class ContextService {
  constructor(
    private dataloaderService: DataloaderService,
    private eventsService: EventsService,
    private groupMemberRequestsService: GroupMemberRequestsService,
    private groupRolesService: GroupRolesService,
    private groupsService: GroupsService,
    private imagesService: ImagesService,
    private postsService: PostsService,
    private proposalActionRolesService: ProposalActionRolesService,
    private proposalActionsService: ProposalActionsService,
    private proposalsService: ProposalsService,
    private refreshTokensService: RefreshTokensService,
    private shieldService: ShieldService,
    private usersService: UsersService
  ) {}

  async getContext({ req }: { req: Request }): Promise<Context> {
    const claims = this.getClaims(req);
    const loaders = this.dataloaderService.getLoaders();
    const permissions = await this.getUserPermisionsFromClaims(claims);
    const user = await this.getUserFromClaims(claims);

    const services: ContextServices = {
      eventsService: this.eventsService,
      groupMemberRequestsService: this.groupMemberRequestsService,
      groupRolesService: this.groupRolesService,
      groupsService: this.groupsService,
      imagesService: this.imagesService,
      postsService: this.postsService,
      proposalActionRolesService: this.proposalActionRolesService,
      proposalActionsService: this.proposalActionsService,
      proposalsService: this.proposalsService,
      refreshTokensService: this.refreshTokensService,
      shieldService: this.shieldService,
      usersService: this.usersService,
    };

    return {
      claims,
      loaders,
      permissions,
      services,
      user,
    };
  }

  private getUserFromClaims(claims: Claims) {
    const sub = getSub(claims.accessTokenClaims);
    return sub ? this.usersService.getUser({ id: sub }) : null;
  }

  private getUserPermisionsFromClaims(claims: Claims) {
    const sub = getSub(claims.accessTokenClaims);
    return sub ? this.usersService.getUserPermissions(sub) : null;
  }

  private getClaims(req: RequestWithCookies) {
    const { cookies } = req;
    const accessTokenClaims = cookies?.auth
      ? decodeToken(cookies.auth.access_token)
      : null;
    const refreshTokenClaims = cookies?.auth
      ? decodeToken(cookies.auth.refresh_token)
      : null;
    return { accessTokenClaims, refreshTokenClaims };
  }
}
