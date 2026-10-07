import { Field, Float, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { type RunAgentResult } from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { RunAgentCostDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/run-agent-cost.dto';
import { RunAgentToolCallDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/run-agent-tool-call.dto';
import { RunAgentUsageDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/run-agent-usage.dto';

@ObjectType('RunAgentResult')
export class RunAgentResultDTO implements RunAgentResult {
  @Field(() => GraphQLJSON, { nullable: true })
  result: object | null;

  @Field(() => String, { nullable: true })
  error: string | null;

  @Field()
  success: boolean;

  @Field(() => UUIDScalarType, { nullable: true })
  threadId: string | null;

  @Field(() => String, { nullable: true })
  errorCode?: string | null;

  @Field(() => String, { nullable: true })
  modelId?: string | null;

  @Field(() => RunAgentUsageDTO, { nullable: true })
  usage?: RunAgentUsageDTO | null;

  @Field(() => RunAgentCostDTO, { nullable: true })
  cost?: RunAgentCostDTO | null;

  @Field(() => [RunAgentToolCallDTO], { nullable: true })
  toolCalls?: RunAgentToolCallDTO[] | null;

  @Field(() => Float, { nullable: true })
  durationMs?: number | null;
}
