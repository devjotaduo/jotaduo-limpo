import { Field, ObjectType } from '@nestjs/graphql';

import {
  type RunAgentToolCall,
  type RunAgentToolCallState,
} from 'twenty-shared/application';

@ObjectType('RunAgentToolCall')
export class RunAgentToolCallDTO implements RunAgentToolCall {
  @Field()
  toolName: string;

  @Field(() => String)
  state: RunAgentToolCallState;
}
