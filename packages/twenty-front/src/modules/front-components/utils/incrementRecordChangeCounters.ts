import { type FrontComponentRecordChangeCounters } from 'twenty-front-component-renderer';

export const incrementRecordChangeCounters = ({
  recordChangeCounters,
  objectNameSingulars,
}: {
  recordChangeCounters: FrontComponentRecordChangeCounters;
  objectNameSingulars: string[];
}): FrontComponentRecordChangeCounters => {
  const watchedObjectNameSingulars = objectNameSingulars.filter(
    (objectNameSingular) =>
      Object.hasOwn(recordChangeCounters, objectNameSingular),
  );

  // Keeping the same object lets React skip the render when no watched object changed.
  if (watchedObjectNameSingulars.length === 0) {
    return recordChangeCounters;
  }

  return {
    ...recordChangeCounters,
    ...Object.fromEntries(
      watchedObjectNameSingulars.map((objectNameSingular) => [
        objectNameSingular,
        recordChangeCounters[objectNameSingular] + 1,
      ]),
    ),
  };
};
