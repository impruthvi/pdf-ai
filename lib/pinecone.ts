import {
  PineconeClient,
  Vector,
  utils as PineconeUtils,
} from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import md5 from "md5";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";

let pinecone: PineconeClient | null = null;

export const getPineconeClient = async () => {
  if (!pinecone) {
    pinecone = new PineconeClient();
    await pinecone.init({
      environment: process.env.PINECONE_ENVIRONMENT!,
      apiKey: process.env.PINECONE_API_KEY!,
    });
    return pinecone;
  }
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadS3IntoPinecone(fileKey: string) {
  // 1. obtain the pdf => download and read from pdf
  console.log("Downloading file from S3");
  const file_name = await downloadFromS3(fileKey);

  // 2. load the pdf into pinecone
  if (!file_name) {
    throw new Error("File not found");
  }

  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  // 3. Split and segment the pdf
  const documents = await Promise.all(pages.map(prepareDocument));

  // 4. Vectorize and embed individual documents
  const vectors = await Promise.all(documents.flat().map(embedDocument));

  // 5. Upload the vectors to pinecone
  const client = await getPineconeClient();
  const pineconeIndex = client?.Index("chat-pdf");

  // if (!pineconeIndex) {
  //   throw new Error("Pinecone index not found");
  // }

  console.log("Uploading vectors to pinecone");

  try {
    PineconeUtils.chunkedUpsert(pineconeIndex, vectors, '', 10);
  } catch (error) {
    console.log(`Error uploading vectors to pinecone: ${error}`);
  }

  return documents[0];
}

async function embedDocument(document: Document) {
  try {
    const embeddings = await getEmbeddings(document.pageContent);
    const hash = md5(document.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        pageNumber: document.metadata.pageNumber,
        text: document.metadata.text,
      },
    } as Vector;
  } catch (error) {
    console.log(`Error calling openai embeddings: ${error}`);
    throw error;
  }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const encoder = new TextEncoder();

  return new TextDecoder("utf-8").decode(encoder.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;

  pageContent = pageContent.replace(/\n/g, "");
  // spli the docs
  const splitter = new RecursiveCharacterTextSplitter();

  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 38000),
      },
    }),
  ]);

  return docs;
}
