import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { Document } from "langchain/document";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { pull } from "langchain/hub";

export class RagService {
  private llm: ChatOllama;
  private store: MemoryVectorStore;
  private embedding: OllamaEmbeddings;

  constructor(model: string = "mistral") {
    // define the llm model
    this.llm = new ChatOllama({
      model,
      temperature: 0,
      maxRetries: 2,
    });

    // setup the embedding model
    this.embedding = new OllamaEmbeddings({
      model: "nomic-embed-text",
      // baseUrl: "http://localhost:11434",
    });

    // setup the vector store
    this.store = new MemoryVectorStore(this.embedding);
  }

  async chain() {
    const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");

    /* const prompt = ChatPromptTemplate.fromMessages([
        ["system", "You are an assistant for question-answering tasks. Use only the retrieved information to answer the question"],
        ["system", "Be concise in your replies and generate answer in paragraph form"],
        ["system", "{context}"],
        ["human", "{question}"],
    ]); */

    return await createStuffDocumentsChain({
      prompt,
      llm: this.llm,
      outputParser: new StringOutputParser(),
    });
  }

  async get(query: string) {
    console.log(`\nYou:\n ${query}`);
    const retriever = this.store.asRetriever();
    const context = await retriever.invoke(query);

    // console.log(context);
    const chain = await this.chain();

    return await chain.invoke({
      question: query,
      context,
    });
  }

  async add(memory: string) {
    const doc = new Document({
      pageContent: memory,
    });

    await this.store.addDocuments([doc]);
  }
}

if (import.meta.main) {
  async function q(llm='mistral') {
    const rag = new RagService(llm);
    rag.add("Callisto is male persian cat who lives with Jason");
    const response = await rag.get("what do you know so far?");
    console.log(`\nAnswer: (${llm})\n ${response.trim()}\n`);
  }

  await q();
  await q("phi3.5")
}
