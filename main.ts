import { RagService } from "./rag.ts";

const rag = new RagService();
rag.add("Callisto is male persian cat who lives with Jason");
rag.add("Jason is a resident of Davao City");
const response = await rag.get("where in the world is callisto");

console.log(`\nAnswer:\n${response}\n\n`);
