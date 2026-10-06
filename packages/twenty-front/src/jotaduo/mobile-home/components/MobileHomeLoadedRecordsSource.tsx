import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ReactNode } from 'react';
import {
  type RecordGqlOperationFilter,
  type RecordGqlOperationGqlRecordFields,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';

export type MobileHomeLoadedRecordsSourceProps = {
  objectNameSingular: string;
  filter: RecordGqlOperationFilter;
  orderBy?: RecordGqlOperationOrderBy;
  recordGqlFields: RecordGqlOperationGqlRecordFields;
  limit: number;
  // The records in sight and how many match in all, past the limit.
  children: (records: ObjectRecord[], totalCount: number) => ReactNode;
};

export const MobileHomeLoadedRecordsSource = ({
  objectNameSingular,
  filter,
  orderBy,
  recordGqlFields,
  limit,
  children,
}: MobileHomeLoadedRecordsSourceProps) => {
  const { records, totalCount } = useFindManyRecords({
    objectNameSingular,
    filter,
    orderBy,
    recordGqlFields,
    limit,
  });

  return <>{children(records, totalCount ?? records.length)}</>;
};
