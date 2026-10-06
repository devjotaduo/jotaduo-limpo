import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';

import {
  MobileHomeLoadedRecordsSource,
  type MobileHomeLoadedRecordsSourceProps,
} from '~/jotaduo/mobile-home/components/MobileHomeLoadedRecordsSource';

type MobileHomeRecordsSourceProps = MobileHomeLoadedRecordsSourceProps;

// Hands its children the records of an object, or none when the workspace
// does not have the object. Twenty's record hooks throw on an object that is
// not there, and the JotaDuo ones only exist with the app installed, so the
// query lives one component down, mounted only when it can run.
export const MobileHomeRecordsSource = ({
  objectNameSingular,
  filter,
  orderBy,
  recordGqlFields,
  limit,
  children,
}: MobileHomeRecordsSourceProps) => {
  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const hasObject = activeNonSystemObjectMetadataItems.some(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === objectNameSingular,
  );

  if (!hasObject) {
    return <>{children([], 0)}</>;
  }

  return (
    <MobileHomeLoadedRecordsSource
      objectNameSingular={objectNameSingular}
      filter={filter}
      orderBy={orderBy}
      recordGqlFields={recordGqlFields}
      limit={limit}
    >
      {children}
    </MobileHomeLoadedRecordsSource>
  );
};
