/**
 * main frontend global scripts
 */

import { anchorScroll } from "./anchorScroll.ts";
import { ariaCurrent } from "./ariaCurrent.ts";
import { decodeTracker } from "./decodeTracker.ts";
import { inView } from "./inView.ts";
import { sleep } from "./sleep.ts";

const main = async () => {
  anchorScroll();
  ariaCurrent();
  decodeTracker();
  inView();
  await sleep(100);
  document.documentElement.classList.add("has-page-active");
};

document.addEventListener("DOMContentLoaded", main);
