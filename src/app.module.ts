import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { GraphQLSchema } from "graphql";
import { applyMiddleware } from "graphql-middleware";
import { GraphQLUpload } from "graphql-upload";
import { AuthModule } from "./auth/auth.module";
import { getClaims, getSub } from "./auth/auth.utils";
import { RefreshTokensModule } from "./auth/refresh-tokens/refresh-tokens.module";
import { RefreshTokensService } from "./auth/refresh-tokens/refresh-tokens.service";
import { shieldPermissions } from "./auth/shield/shield.permissions";
import { Environment } from "./common/common.constants";
import { Context, ContextServices } from "./common/common.types";
import { DatabaseModule } from "./database/database.module";
import { DataloaderModule } from "./dataloader/dataloader.module";
import { DataloaderService } from "./dataloader/dataloader.service";
import { EventsModule } from "./events/events.module";
import { GroupMemberRequestsModule } from "./groups/group-member-requests/group-member-requests.module";
import { GroupMemberRequestsService } from "./groups/group-member-requests/group-member-requests.service";
import { GroupRolesModule } from "./groups/group-roles/group-roles.module";
import { GroupRolesService } from "./groups/group-roles/group-roles.service";
import { GroupsModule } from "./groups/groups.module";
import { GroupsService } from "./groups/groups.service";
import { ImagesModule } from "./images/images.module";
import { LikesModule } from "./likes/likes.module";
import { PostsModule } from "./posts/posts.module";
import { PostsService } from "./posts/posts.service";
import { ProposalsModule } from "./proposals/proposals.module";
import { ProposalsService } from "./proposals/proposals.service";
import { ServerInvitesModule } from "./server-invites/server-invites.module";
import { ServerRolesModule } from "./server-roles/server-roles.module";
import { UsersModule } from "./users/users.module";
import { UsersService } from "./users/users.service";
import { VotesModule } from "./votes/votes.module";

const ApolloModule = GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  imports: [
    DataloaderModule,
    GroupMemberRequestsModule,
    GroupRolesModule,
    GroupsModule,
    PostsModule,
    ProposalsModule,
    RefreshTokensModule,
    UsersModule,
  ],
  inject: [
    ConfigService,
    DataloaderService,
    GroupMemberRequestsService,
    GroupRolesService,
    GroupsService,
    PostsService,
    ProposalsService,
    RefreshTokensService,
    UsersService,
  ],
  useFactory(
    configService: ConfigService,
    dataloaderService: DataloaderService,
    groupMemberRequestsService: GroupMemberRequestsService,
    groupRolesService: GroupRolesService,
    groupsService: GroupsService,
    postsService: PostsService,
    proposalsService: ProposalsService,
    refreshTokensService: RefreshTokensService,
    usersService: UsersService
  ) {
    return {
      context: async ({ req }: { req: Request }): Promise<Context> => {
        const claims = getClaims(req);
        const sub = getSub(claims.accessTokenClaims);
        const permissions = sub
          ? await usersService.getUserPermissions(sub)
          : null;
        const user = sub ? await usersService.getUser({ id: sub }) : null;

        const loaders = dataloaderService.getLoaders();
        const services: ContextServices = {
          groupMemberRequestsService,
          groupRolesService,
          groupsService,
          postsService,
          proposalsService,
          refreshTokensService,
          usersService,
        };

        return {
          claims,
          loaders,
          permissions,
          services,
          user,
        };
      },
      transformSchema: (schema: GraphQLSchema) => {
        schema = applyMiddleware(schema, shieldPermissions);
        return schema;
      },
      autoSchemaFile: true,
      cors: { origin: true, credentials: true },
      csrfPrevention: configService.get("NODE_ENV") !== Environment.Development,
      resolvers: { Upload: GraphQLUpload },
    };
  },
});

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ApolloModule,
    AuthModule,
    DatabaseModule,
    DataloaderModule,
    EventsModule,
    GroupsModule,
    ImagesModule,
    LikesModule,
    PostsModule,
    ProposalsModule,
    ServerInvitesModule,
    ServerRolesModule,
    UsersModule,
    VotesModule,
  ],
})
export class AppModule {}
