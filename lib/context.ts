import { PineconeClient } from "@pinecone-database/pinecone";
import { convertToAscii } from "@/lib/utils";
import { getEmbeddings } from "@/lib/embeddings";

export async function getMatchesFromEmbedding(
  embedding: number[],
  fileKey: string
) {
  const pinecone = new PineconeClient();

  await pinecone.init({
    apiKey: process.env.PINECONE_API_KEY!,
    environment: process.env.PINECONE_ENVIRONMENT!,
  });

  const index = await pinecone.Index(process.env.PINECONE_INDEX_NAME!);

  try {
    // const namespace = convertToAscii(fileKey);

    const queryResult = await index.query({
      queryRequest: {
        topK: 5,
        vector: embedding,
        includeMetadata: true,
      },
    });

    return queryResult.matches || [];
  } catch (error) {
    console.log(`error querying embeddings: ${error}`);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  const queryEmbedding = await getEmbeddings(query);
  const maches = await getMatchesFromEmbedding(queryEmbedding, fileKey);

  const qualifyingMatches = maches.filter(
    (match) =>
      match.score &&
      match.score > parseFloat(process.env.PINECONE_MATCH_THRESHOLD!)
  );

  type Metadata = {
    text: string;
    pageNumber: number;
  };

  const docs = qualifyingMatches.map(
    (match) => (match.metadata as Metadata).text
  );
  // TODO: this is a hack to get around the 3000 character limit on the
  return docs.join("\n").substring(0, 3000);
}
