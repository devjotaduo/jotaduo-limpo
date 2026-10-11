import { Field, ObjectType } from '@nestjs/graphql';

import { IsArray, IsIn, IsNotEmpty, IsNumber } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { type GeneratedUiConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('GeneratedUiConfiguration')
export class GeneratedUiConfigurationDTO implements GeneratedUiConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.AI_GENERATED_UI])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.AI_GENERATED_UI;

  @Field(() => Number)
  @IsNumber()
  schemaVersion: 1;

  @Field(() => GraphQLJSON)
  @IsArray()
  @IsNotEmpty()
  blocks: GeneratedUiConfiguration['blocks'];
}
