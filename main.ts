import { RagService } from "./rag.ts";

if (import.meta.main) {
  const rag = new RagService();
  rag.add("Callisto is male persian cat who lives with Jason");
  // rag.add("Jason is a resident of Davao City");
  const response = await rag.get("Tell me about the cat");

  console.log(`\nAnswer:\n${response}\n\n`);
}
