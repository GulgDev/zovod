import { expect } from "vitest";
import * as matchers from "jest-extended";

expect.extend(matchers);

import "core-js/es/map/get-or-insert-computed";
import "core-js/es/weak-map/get-or-insert-computed";
