import { assertEquals } from "@std/assert";
import { greet } from "./hello.ts";

Deno.test(function addTest() {
  assertEquals(greet("jason"), "Hi jason!");
});
