import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserInputError } from "apollo-server-express";
import * as fs from "fs";
import { FileUpload } from "graphql-upload";
import { FindOptionsWhere, In, Repository } from "typeorm";
import { DEFAULT_PAGE_SIZE } from "../common/common.constants";
import { IsFollowedByMeKey } from "../dataloader/dataloader.types";
import { randomDefaultImagePath, saveImage } from "../images/image.utils";
import { ImagesService, ImageType } from "../images/images.service";
import { Image } from "../images/models/image.model";
import { Post } from "../posts/models/post.model";
import { PostsService } from "../posts/posts.service";
import { Proposal } from "../proposals/models/proposal.model";
import { RolesService } from "../roles/roles.service";
import { UpdateUserInput } from "./models/update-user.input";
import { User } from "./models/user.model";
import {
  UserPermissions,
  UserWithFollowerCount,
  UserWithFollowingCount,
} from "./user.types";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,

    @Inject(forwardRef(() => RolesService))
    private rolesService: RolesService,

    private imagesService: ImagesService,
    private postsService: PostsService
  ) {}

  async getUser(where: FindOptionsWhere<User>, relations?: string[]) {
    return await this.repository.findOne({ where, relations });
  }

  async getUsers(where?: FindOptionsWhere<User>) {
    return this.repository.find({ where });
  }

  async isFirstUser() {
    const userCount = await this.repository.count();
    return userCount === 0;
  }

  async getCoverPhoto(userId: number) {
    return this.imagesService.getImage({
      imageType: ImageType.CoverPhoto,
      userId,
    });
  }

  async getUserHomeFeed(id: number) {
    const userWithFeed = await this.getUser({ id }, [
      "groups.proposals",
      "groups.posts",
      "following.posts",
      "proposals",
      "posts",
    ]);
    if (!userWithFeed) {
      throw new UserInputError("User not found");
    }
    const { groups, following, posts, proposals } = userWithFeed;

    // Initialize maps with posts and proposals by this user
    const postMap = posts.reduce<Record<number, Post>>((result, post) => {
      result[post.id] = post;
      return result;
    }, {});
    const proposalMap = proposals.reduce<Record<number, Proposal>>(
      (result, proposal) => {
        result[proposal.id] = proposal;
        return result;
      },
      {}
    );

    // Insert posts from followed users
    for (const follow of following) {
      for (const post of follow.posts) {
        postMap[post.id] = post;
      }
    }

    // Insert posts and proposals from groups joined
    for (const group of groups) {
      for (const post of group.posts) {
        postMap[post.id] = post;
      }
      for (const proposal of group.proposals) {
        proposalMap[proposal.id] = proposal;
      }
    }

    const sortedFeed = [
      ...Object.values(postMap),
      ...Object.values(proposalMap),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // TODO: Update once pagination has been implemented
    return sortedFeed.slice(0, DEFAULT_PAGE_SIZE);
  }

  async getUserProfileFeed(id: number) {
    const user = await this.getUser({ id }, ["proposals", "posts"]);
    if (!user) {
      throw new UserInputError("User not found");
    }
    const sortedFeed = [...user.posts, ...user.proposals].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    // TODO: Update once pagination has been implemented
    return sortedFeed.slice(0, DEFAULT_PAGE_SIZE);
  }

  async getUserPermissions(id: number) {
    const user = await this.getUser({ id }, ["roles.permissions"]);
    if (!user) {
      throw new UserInputError("User not found");
    }
    return user.roles.reduce<UserPermissions>(
      (result, { groupId, permissions }) => {
        for (const { name, enabled } of permissions) {
          if (!enabled) {
            continue;
          }
          if (groupId) {
            if (!result.groupPermissions[groupId]) {
              result.groupPermissions[groupId] = new Set();
            }
            result.groupPermissions[groupId].add(name);
            continue;
          }
          result.serverPermissions.add(name);
        }
        return result;
      },
      { serverPermissions: new Set(), groupPermissions: {} }
    );
  }

  async getJoinedGroups(id: number) {
    const userWithGroups = await this.getUser({ id }, ["groups"]);
    if (!userWithGroups) {
      return [];
    }
    return userWithGroups.groups;
  }

  async getFollowers(id: number) {
    const user = await this.getUser({ id }, ["followers"]);
    if (!user) {
      throw new UserInputError("User not found");
    }

    // TODO: Update once pagination has been implemented
    return user.followers.slice(0, DEFAULT_PAGE_SIZE);
  }

  async getFollowing(id: number) {
    const user = await this.getUser({ id }, ["following"]);
    if (!user) {
      throw new UserInputError("User not found");
    }
    return user.following;
  }

  async isUsersPost(postId: number, userId: number) {
    const post = await this.postsService.getPost(postId);
    return post.userId === userId;
  }

  async getUsersByBatch(userIds: number[]) {
    const users = await this.getUsers({
      id: In(userIds),
    });
    return userIds.map(
      (id) =>
        users.find((user: User) => user.id === id) ||
        new Error(`Could not load user: ${id}`)
    );
  }

  async getProfilePicturesByBatch(userIds: number[]) {
    const profilePictures = await this.imagesService.getImages({
      imageType: ImageType.ProfilePicture,
      userId: In(userIds),
    });
    return userIds.map(
      (id) =>
        profilePictures.find(
          (profilePicture: Image) => profilePicture.userId === id
        ) || new Error(`Could not load profile picture: ${id}`)
    );
  }

  async getFollowerCountByBatch(userIds: number[]) {
    const users = (await this.repository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.followers", "follower")
      .loadRelationCountAndMap("user.followerCount", "user.followers")
      .select(["user.id"])
      .whereInIds(userIds)
      .getMany()) as UserWithFollowerCount[];

    return userIds.map((id) => {
      const user = users.find((user: User) => user.id === id);
      if (!user) {
        return new Error(`Could not load followers count for user: ${id}`);
      }
      return user.followerCount;
    });
  }

  async getFollowingCountByBatch(userIds: number[]) {
    const users = (await this.repository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.following", "followed")
      .loadRelationCountAndMap("user.followingCount", "user.following")
      .select(["user.id"])
      .whereInIds(userIds)
      .getMany()) as UserWithFollowingCount[];

    return userIds.map((id) => {
      const user = users.find((user: User) => user.id === id);
      if (!user) {
        return new Error(`Could not load following count for user: ${id}`);
      }
      return user.followingCount;
    });
  }

  async getIsFollowedByMeByBatch(keys: IsFollowedByMeKey[]) {
    const followedUserIds = keys.map(({ followedUserId }) => followedUserId);
    const following = await this.getFollowing(keys[0].currentUserId);

    return followedUserIds.map((followedUserId) =>
      following.some((followedUser: User) => followedUser.id === followedUserId)
    );
  }

  async createUser(data: Partial<User>) {
    const user = await this.repository.save(data);
    const users = await this.getUsers();

    try {
      if (users.length === 1) {
        await this.rolesService.initAdminRole(user.id);
      }
      await this.saveDefaultProfilePicture(user.id);
    } catch {
      await this.deleteUser(user.id);
      throw new Error("Could not create user");
    }
    return user;
  }

  async updateUser({
    id,
    coverPhoto,
    profilePicture,
    ...userData
  }: UpdateUserInput) {
    await this.repository.update(id, userData);
    const user = await this.getUser({ id });

    if (profilePicture) {
      await this.saveProfilePicture(id, profilePicture);
    }
    if (coverPhoto) {
      await this.saveCoverPhoto(id, coverPhoto);
    }
    return { user };
  }

  async followUser(id: number, followerId: number) {
    const user = await this.getUser({ id }, ["followers"]);
    const follower = await this.getUser({ id: followerId }, ["following"]);
    if (!user || !follower) {
      throw new UserInputError("User not found");
    }
    follower.following = [...follower.following, user];
    user.followers = [...user.followers, follower];
    await this.repository.save(follower);
    await this.repository.save(user);
    return {
      followedUser: user,
      follower,
    };
  }

  async unfollowUser(id: number, followerId: number) {
    const user = await this.getUser({ id }, ["followers"]);
    const follower = await this.getUser({ id: followerId }, ["following"]);
    if (!user || !follower) {
      throw new UserInputError("User not found");
    }
    // TODO: Refactor to avoid using `filter`
    user.followers = user.followers.filter((f) => f.id !== followerId);
    follower.following = follower.following.filter((f) => f.id !== id);
    await this.repository.save([user, follower]);
    return true;
  }

  async saveProfilePicture(
    userId: number,
    profilePicture: Promise<FileUpload>
  ) {
    const filename = await saveImage(profilePicture);
    const imageData = { imageType: ImageType.ProfilePicture, userId };
    await this.imagesService.deleteImage(imageData);
    return this.imagesService.createImage({
      ...imageData,
      filename,
    });
  }

  async saveCoverPhoto(userId: number, coverPhoto: Promise<FileUpload>) {
    const filename = await saveImage(coverPhoto);
    const imageData = { imageType: ImageType.CoverPhoto, userId };
    await this.imagesService.deleteImage(imageData);
    return this.imagesService.createImage({
      ...imageData,
      filename,
    });
  }

  async saveDefaultProfilePicture(userId: number) {
    const sourcePath = randomDefaultImagePath();
    const filename = `${Date.now()}.jpeg`;
    const copyPath = `./uploads/${filename}`;

    fs.copyFile(sourcePath, copyPath, (err) => {
      if (err) {
        throw new Error(`Failed to save default profile picture: ${err}`);
      }
    });

    const image = await this.imagesService.createImage({
      imageType: ImageType.ProfilePicture,
      filename,
      userId,
    });
    return image;
  }

  async deleteUser(userId: number) {
    return this.repository.delete(userId);
  }
}
