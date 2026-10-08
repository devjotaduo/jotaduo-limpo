type ItemWithUniversalIdentifier = {
  id: string;
  universalIdentifier?: string | null;
};

// Apps only know the universalIdentifier from their manifest, while host lookups need the workspace id; ids win so existing callers keep their behavior.
export const resolveIdFromIdOrUniversalIdentifier = ({
  idOrUniversalIdentifier,
  items,
}: {
  idOrUniversalIdentifier: string;
  items: ItemWithUniversalIdentifier[];
}): string => {
  if (items.some((item) => item.id === idOrUniversalIdentifier)) {
    return idOrUniversalIdentifier;
  }

  return (
    items.find((item) => item.universalIdentifier === idOrUniversalIdentifier)
      ?.id ?? idOrUniversalIdentifier
  );
};
