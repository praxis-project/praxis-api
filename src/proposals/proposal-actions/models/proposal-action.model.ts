import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Image } from "../../../images/models/image.model";
import { Proposal } from "../../models/proposal.model";
import { ProposalActionRole } from "./proposal-action-role.model";

@Entity()
@ObjectType()
export class ProposalAction {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column()
  @Field()
  actionType: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  groupName?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  groupDescription?: string;

  @OneToOne(() => Image, (image) => image.proposalAction, {
    cascade: true,
  })
  @Field(() => Image, { nullable: true })
  groupCoverPhoto?: Image;

  @Field(() => [ProposalActionRole], { nullable: true })
  @OneToMany(
    () => ProposalActionRole,
    (proposedRole) => proposedRole.proposalAction,
    {
      cascade: true,
      nullable: true,
    }
  )
  roles?: ProposalActionRole[];

  @Field(() => Proposal)
  @OneToOne(() => Proposal, (proposal) => proposal.action, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  proposal: Proposal;

  @Column()
  proposalId: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
