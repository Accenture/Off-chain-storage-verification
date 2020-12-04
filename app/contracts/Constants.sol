pragma solidity ^0.4.19;

contract Constants {
  uint32 public nbOfChunks; // Number of chunks to be stored = k
  uint32 public nbOfChunksEC; // Number of chunks after erasure code = n
  uint32 public snToBeChallenged;// Nb of storage nodes to challenge during this round = l
  uint32 public chunkToBeChallenged;// Nb of chunk to challenge per storage node = p
  uint32 public snNb; // Number of storage nodes storing a certain file = m


  function Constants (uint32 k, uint32 n , uint32 l, uint32 m, uint32 p) public {
    nbOfChunks = k;
    nbOfChunksEC = n;
    snToBeChallenged = l;
    snNb = m;
    chunkToBeChallenged = p;

  }

  // Setters for k,n, l and m
  function setK(uint32 k) public {
    nbOfChunks = k;
  }
  function setN(uint32 n) public {
    nbOfChunksEC = n;
  }
  function setSnToBeChallenged(uint32 l) public {
    snToBeChallenged = l;
  }
  function setSnNb(uint32 m) public {
    snNb = m;
  }
  function setChunkToBeChallenged(uint32 p) public {
    chunkToBeChallenged = p;
  }

  // Getters for k,n,l,m
  function getK() constant public returns (uint32 ) {
    return nbOfChunks;
  }
  function getN() constant public returns (uint32 ) {
    return nbOfChunksEC;
  }
  function getL() constant public returns (uint32 ) {
    return snToBeChallenged;
  }
  function getP() constant public returns (uint32 ) {
    return chunkToBeChallenged;
  }
  function getM() constant public returns (uint32 ) {
    return snNb;
  }
  function getAll() constant public returns (uint32 k, uint32 n, uint32 l, uint32 m, uint32 p) {
    return (nbOfChunks, nbOfChunksEC, snToBeChallenged, snNb, chunkToBeChallenged);
  }
}
