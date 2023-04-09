import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class DeleteRoleMemberInput {
  @Field(() => Int)
  roleId: number;

  @Field(() => Int)
  userId: number;
}
