// Vendor
import {helper} from '@ember/component/helper';

interface RankedEntity {
  rank: number;
}

export const ranked = ([entities]: [RankedEntity[]]): RankedEntity[] => {
  return entities.sort((entityA, entityB) => entityA.rank - entityB.rank);
};

export default helper(ranked);
