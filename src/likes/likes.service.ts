import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Comment } from '../comments/models/comment.model';
import { GroupPrivacy } from '../groups/groups.constants';
import { NotificationType } from '../notifications/notifications.constants';
import { NotificationsService } from '../notifications/notifications.service';
import { Post } from '../posts/models/post.model';
import { User } from '../users/models/user.model';
import { CreateLikeInput } from './models/create-like.input';
import { DeleteLikeInput } from './models/delete-like.input';
import { Like } from './models/like.model';
import { Answer } from '../questions/models/answer.model';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,

    @InjectRepository(Post)
    private postRepository: Repository<Post>,

    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,

    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,

    private notificationsService: NotificationsService,
  ) {}

  async getLikes({ postId, commentId }: FindOptionsWhere<Like>) {
    if (!postId && !commentId) {
      throw new Error('Either postId or commentId must be provided');
    }
    return this.likeRepository.find({
      where: { postId, commentId },
    });
  }

  async getLikedPost(postId: number) {
    return this.postRepository.findOneOrFail({
      where: { id: postId },
    });
  }

  async isPublicLike(likeId: number) {
    const { post, comment } = await this.likeRepository.findOneOrFail({
      where: { id: likeId },
      relations: [
        'comment.post.event.group.config',
        'comment.post.group.config',
        'comment.proposal.group.config',
        'post.event.group.config',
        'post.group.config',
      ],
    });
    return (
      comment?.post?.event?.group?.config.privacy === GroupPrivacy.Public ||
      comment?.post?.group?.config.privacy === GroupPrivacy.Public ||
      comment?.proposal?.group?.config.privacy === GroupPrivacy.Public ||
      post?.event?.group?.config.privacy === GroupPrivacy.Public ||
      post?.group?.config.privacy === GroupPrivacy.Public
    );
  }

  async getLikedItem(like: Like) {
    if (like.commentId) {
      return this.commentRepository.findOneOrFail({
        where: { id: like.commentId },
      });
    }
    if (like.answerId) {
      return this.answerRepository.findOneOrFail({
        where: { id: like.answerId },
        relations: ['questionnaireTicket'],
      });
    }
    return this.postRepository.findOneOrFail({
      where: { id: like.postId },
    });
  }

  getLikedItemUserId(likedItem: Post | Comment | Answer) {
    if (likedItem instanceof Answer) {
      return likedItem.questionnaireTicket.userId;
    }
    return likedItem.userId;
  }

  getLikedItemNotificationType(likedItem: Post | Comment | Answer) {
    if (likedItem instanceof Answer) {
      return NotificationType.AnswerLike;
    }
    if (likedItem instanceof Comment) {
      return NotificationType.CommentLike;
    }
    return NotificationType.PostLike;
  }

  async createLike(likeData: CreateLikeInput, user: User) {
    const like = await this.likeRepository.save({
      ...likeData,
      userId: user.id,
    });

    const likedItem = await this.getLikedItem(like);
    const likedItemUserId = this.getLikedItemUserId(likedItem);
    const notificationType = this.getLikedItemNotificationType(likedItem);

    if (likedItemUserId !== user.id) {
      await this.notificationsService.createNotification({
        notificationType,
        commentId: like.commentId,
        userId: likedItemUserId,
        otherUserId: user.id,
        answerId: like.answerId,
        postId: like.postId,
        likeId: like.id,
      });
    }

    if (like.commentId) {
      return { like, comment: likedItem };
    }
    if (like.answerId) {
      return { like, answer: likedItem };
    }
    return { like, post: likedItem };
  }

  async deleteLike(likeData: DeleteLikeInput, user: User) {
    await this.likeRepository.delete({ userId: user.id, ...likeData });
    return true;
  }
}
