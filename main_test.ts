import { assertEquals } from "@std/assert";
import { greet } from "./hello.ts";

Deno.test(function greetTest() {
  assertEquals(greet("jason"), "Hi jason!");
});
