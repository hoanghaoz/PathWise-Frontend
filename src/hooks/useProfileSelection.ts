import { useState } from "react";

interface Initial {
  directionId: string;
  targetIds: string[];
  knownIds: string[];
}

const toggled = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

/**
 * Direction + target/known skill selection of the learning profile form.
 * Changing the direction clears both lists: the target must be re-checked
 * against the new direction, and the picker only lists its skills.
 */
export function useProfileSelection(initial: Initial) {
  const [directionId, setDirectionId] = useState(initial.directionId);
  const [targetIds, setTargetIds] = useState(initial.targetIds);
  const [knownIds, setKnownIds] = useState(initial.knownIds);

  return {
    directionId,
    targetIds,
    knownIds,
    chooseDirection: (id: string) => {
      if (id === directionId) return;
      setDirectionId(id);
      setTargetIds([]);
      setKnownIds([]);
    },
    toggleTarget: (id: string) => setTargetIds((list) => toggled(list, id)),
    toggleKnown: (id: string) => setKnownIds((list) => toggled(list, id)),
  };
}

/** Same ids, ignoring order. */
export const sameIds = (a: string[], b: string[]) =>
  a.length === b.length && a.every((id) => b.includes(id));
