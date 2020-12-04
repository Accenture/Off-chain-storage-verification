pragma solidity ^0.4.19;
import "StorageFactory.sol";
import "Constants.sol";
import "Identity.sol";



contract Validation {
  enum States { Initialize, Acknowledge, Propose, Validate}
  address owner;
  address storageNode;
  States state;
  Validation previous;
  StorageFactory sfactory;
  Constants constants;
  Identity identity;
  bytes seed;

  bytes32 _file;
  address _trustedDealer;
  address _storage;

  mapping(address => bool) public validators;
  mapping(uint32 => uint32) public storagenodes;
  mapping(uint32 => uint32) public chunkselection;
  uint32 iteration;
  
  event ChunkSelection(uint32[] chunks);
  event StorageNodeSelected(
    address trustedDealer,
    bytes32 file,
    address[] storageNodes,
    uint32[] chunks);

  event ProofReceived(
    address storageNode,
    uint32 state);

  event VoteCast(
    address validator,
    uint32 state);

  function Validation(address _owner, Validation _previous, StorageFactory _sfactory, Constants _constants, Identity _identity, bytes _seed) public {
    state = States.Initialize;
    owner = _owner;
    previous = _previous;
    sfactory = _sfactory;
    constants = _constants;
    identity = _identity;
    seed = _seed;
  }

  modifier onlyOwner {
    require(msg.sender == owner);
    _;
  }

  function storageNodeSelect() onlyOwner public returns(address trustedDealer, bytes32 file, address[] storageNodes, uint32[] chunks){
    (_storage, _trustedDealer, _file) = sfactory.getFromPool(seed, owner);
    uint32 _numSNF =  identity.getSnNumber();
    uint32 l = constants.getL();
    address[] memory _storageNodes = new address[](l);
    uint32[] memory _chunks = new uint32[](l);
    for(uint32 i = 0; i < l; i++){
      uint32 j = uint32(keccak256(seed, this, _trustedDealer, _file, owner, now, i, _storage)) % _numSNF;
      uint32 _idx3 = j;
      while (storagenodes[_idx3] == _idx3){
        _idx3 = (_idx3 + 1) % _numSNF;
      }
      storagenodes[_idx3] = _idx3;
      //_storageNodes[]i] = sfactory.getStorageNode(_idx0, _idx1, _idx2, _idx3);
      _storageNodes[i] = identity.getStorageNodeFromIndex(_idx3);
      //_chunks[i] = sfactory.getRandomChunkIndex(seed, _trustedDealer, _file, _storageNodes[i]);
    }
    state = States.Acknowledge;
    StorageNodeSelected(_trustedDealer, _file, _storageNodes, _chunks);
    return (_trustedDealer, _file, _storageNodes, _chunks);
  }

  function chunksNodeSelect(address _storageNode) onlyOwner public returns (uint32[] selectedIndexes) {
    uint32 p = constants.getP();
    uint32 n = constants.getN();
    uint32 k = constants.getK();
    iteration++;
    uint32[] memory chunks = new uint32[](p);
    for (uint32 i=0; i<p; i++) {
      uint32 j = uint32(keccak256(seed, this, _storageNode, _trustedDealer, _file, owner, now, i)) % k;
      uint32 cpj = j;
      while (chunkselection[cpj] == iteration){
        cpj = (cpj + 1) % k;
      }
      chunkselection[cpj] = iteration;
      chunks[i] = uint32(keccak256(_storageNode, _file, cpj))%(n); //chunkselected[cpj];
    }
    ChunkSelection(chunks);
    return chunks;
  }

  function receiveProof(address pubKeySn) onlyOwner public {
    if (state == States.Acknowledge){
      storageNode =  pubKeySn;
      state = States.Propose;
      ProofReceived(storageNode, uint32(state));
    }
  }

  function castVote(bool vote) public {
    if (identity.isValidator(msg.sender)){
      validators[msg.sender] = vote;
      //Add logic for the state to change
      state = States.Validate;
      VoteCast(msg.sender, uint32(state));
    }
  }

  function getOwner() constant public returns(address ) {
    return owner;
  }

  function getTrustedDealer() constant public returns(address ) {
    return _trustedDealer;
  }

  function getState() constant public returns(uint32 ) {
    return uint32(state);
  }


}
