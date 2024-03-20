/* eslint-disable @typescript-eslint/no-namespace */
import { type EmotionMatchers, matchers as emotionMatchers } from "@emotion/jest";
import domMatchers, { type TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect as viExpect } from "vitest";

declare global {
  namespace Vi {
    type JestAssertion<T = any> = jest.Matchers<void, T> &
      TestingLibraryMatchers<T, void> &
      EmotionMatchers;
  }
}

viExpect.extend(domMatchers);
viExpect.extend(emotionMatchers as any);

afterEach(cleanup);
