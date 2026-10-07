import { Field, Int, ObjectType } from '@nestjs/graphql';

import { type RunAgentUsage } from 'twenty-shared/application';

@ObjectType('RunAgentUsage')
export class RunAgentUsageDTO implements RunAgentUsage {
  @Field(() => Int)
  inputTokens: number;

  @Field(() => Int)
  outputTokens: number;

  @Field(() => Int, { nullable: true })
  reasoningTokens: number | null;

  @Field(() => Int, { nullable: true })
  cacheReadTokens: number | null;

  @Field(() => Int, { nullable: true })
  cacheCreationTokens: number | null;

  @Field(() => Int)
  totalTokens: number;

  @Field(() => Int)
  nativeWebSearchCallCount: number;
}
