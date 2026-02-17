import crypto from "crypto";
import { Block } from "../models/Block.js";

// Simple lightweight blockchain storing hashed votes only.
// Each block's hash is derived from (index, timestamp, voteHash, previousHash).
// This gives us a proof-of-integrity: if any block is tampered with, all subsequent hashes break.

export class Blockchain {
  constructor() {
    this.chain = [];
  }

  // Initialize from DB or create a genesis block if empty.
  async init() {
    const blocks = await Block.find().sort({ index: 1 }).lean();
    if (!blocks.length) {
      const genesisBlock = await this._createGenesisBlock();
      this.chain = [genesisBlock];
    } else {
      this.chain = blocks;
    }
  }

  async _createGenesisBlock() {
    const genesisData = {
      index: 0,
      timestamp: new Date(),
      voteHash: "GENESIS",
      previousHash: "0",
    };
    const hash = this._calculateHash(
      genesisData.index,
      genesisData.timestamp,
      genesisData.voteHash,
      genesisData.previousHash
    );
    const block = await Block.create({ ...genesisData, hash });
    return block.toObject();
  }

  _calculateHash(index, timestamp, voteHash, previousHash) {
    return crypto
      .createHash("sha256")
      .update(
        index.toString() +
          "|" +
          timestamp.toISOString() +
          "|" +
          voteHash +
          "|" +
          previousHash
      )
      .digest("hex");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Add a new block for a given vote hash.
  // Only minimal voteHash goes on-chain – no voter identity or plaintext vote.
  async addBlock(voteHash) {
    const latest = this.getLatestBlock();
    const index = latest.index + 1;
    const timestamp = new Date();
    const previousHash = latest.hash;
    const hash = this._calculateHash(index, timestamp, voteHash, previousHash);

    const newBlock = await Block.create({
      index,
      timestamp,
      voteHash,
      previousHash,
      hash,
    });

    this.chain.push(newBlock.toObject());
    return newBlock;
  }

  // Verify that each block links correctly to the previous one,
  // and that its stored hash matches the recomputed hash.
  async isChainValid() {
    if (!this.chain.length) {
      await this.init();
    }

    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const prev = this.chain[i - 1];

      const recalculatedHash = this._calculateHash(
        current.index,
        current.timestamp,
        current.voteHash,
        current.previousHash
      );

      if (current.hash !== recalculatedHash) {
        return { valid: false, reason: `Hash mismatch at index ${current.index}` };
      }

      if (current.previousHash !== prev.hash) {
        return {
          valid: false,
          reason: `Previous hash mismatch at index ${current.index}`,
        };
      }
    }

    return { valid: true };
  }
}

// Singleton instance used across the app
export const blockchain = new Blockchain();


