import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { Document } from "langchain/document";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { pull } from "langchain/hub";

export class RagService {
  private llm: ChatOllama;
  private store: MemoryVectorStore;
  private embedding: OllamaEmbeddings;

  constructor() {
    // define the llm model
    this.llm = new ChatOllama({
      model: "mistral:latest",
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
