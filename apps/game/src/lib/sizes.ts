// Sizes and offsets of factory map elements

export const TILE_SIZE = 1,
  TILE_GAP = TILE_SIZE * 0.45;

// Offset odd columns vertically so that the gaps connect the centers of
// surrounding tiles:
// ######  ######
//         ######
// ######  ######
// ######
// ######  ######
//         ######
// ######  ######
export const ODD_COLUMN_Y_OFFSET = (TILE_SIZE + TILE_GAP) / 2;
