import { Field, Float, ObjectType } from '@nestjs/graphql';

import { type RunAgentCost } from 'twenty-shared/application';

@ObjectType('RunAgentCost')
export class RunAgentCostDTO implements RunAgentCost {
  @Field(() => Float)
  totalCostInDollars: number;

  // micro-credits exceed a 32-bit Int past about $2,000
  @Field(() => Float)
  creditsUsedMicro: number;
}
