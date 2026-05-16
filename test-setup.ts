import { beforeEach, expect } from "vitest";
import * as matchers from "jest-extended";
import { resetAllWhenMocks } from "jest-when";

expect.extend(matchers);

beforeEach(() => {
  resetAllWhenMocks();
});

import "core-js/es/map/get-or-insert-computed";
import "core-js/es/weak-map/get-or-insert-computed";
