pragma solidity ^0.4.19;
import "Constants.sol";
import "Identity.sol";
import "Storage.sol";

contract StorageFactory {
  Identity identity;
  Constants constants;

  event FileStored(bool stored, uint32 files, bytes32 filename);
  event ChunkSelection(uint32[] chunks);

  mapping(uint32 => Storage) storages;
  uint32 storagesize;

  mapping(uint32 => uint32) selection;
  uint32 iteration;

  function StorageFactory(Identity _identity, Constants _constants) public{
    identity = _identity;
    constants = _constants;
    storagesize = 1;
    storages[storagesize - 1] = new Storage(identity, constants);
  }

  // Functions run by the Trusted dealer to select the SNs who will receive his file
  function storageSelection(bytes32 filePk) public view returns (address[] SNSelected) {
    uint32 snNum = identity.getSnNumber();
    uint32 m = constants.getM();
    address[] memory snSelected;
    //if m = 0 or m > snNum return all storages
    if (m == 0 || m > snNum){
      snSelected = new address[](snNum);
      for (uint32 i = 0; i < snNum ; i++){
        snSelected[i] = identity.getStorageNodeFromIndex(i);
      }
    }
    else{
      snSelected = new address[](m);
      uint32[] memory indexes = new uint32[](m);
      for(uint32 l=0; l<m; l++){
        indexes[l] = snNum + 1;
        uint32 p = uint32(keccak256(filePk, now, msg.sender, l))%(snNum);
        uint32 idx = p;
        while (isSelected(idx, indexes, l)){
          idx = (idx + 1) % snNum;
        }
        indexes[l] = idx;
        snSelected[l] = identity.getStorageNodeFromIndex(idx);
      }
    }
    return snSelected;
  }
  /*This function refers to the GetFrag function from the original paper*/
  function chunksSelect(address snPk, bytes32 filePk) public returns (uint32[] selectedIndexes) {
    uint32 n = constants.getN();
    uint32 k = constants.getK();
    iteration++;
    uint32[] memory chunks = new uint32[](k);
    for (uint32 i=0; i<k; i++) {
      uint32 j = uint32(keccak256(snPk, filePk, i))%(n);
      uint32 cpj = j;
      while (selection[cpj] == iteration){
        cpj = (cpj + 1) % n;
      }
      selection[cpj] = iteration;
      chunks[i] = cpj;
    }
    ChunkSelection(chunks);
    return chunks;
  }

  function isSelected(uint32 v, uint32[] a, uint32 l) pure private returns (bool) {
    for(uint32 i = 0; i<l; i++){
      if (a[i] == v){
        return true;
      }
    }
    return false;
  }

  function addToPool(address pubKeyTd, bytes32 pubKeyFile, uint32 hashtag) public{
    //for (uint32 i=0; i<hashtags.length; i++) {
    //  uint32 hashtag = hashtags[i];
      if (storages[storagesize - 1].isStorageFull(pubKeyTd, pubKeyFile, msg.sender)){
        storagesize++;
        storages[storagesize - 1] = new Storage(identity, constants);
        if(storages[storagesize - 1].addToPool(pubKeyTd, pubKeyFile, msg.sender, hashtag)){
          FileStored(true, storagesize, pubKeyFile);
        }
        else{
          FileStored(false, storagesize, pubKeyFile);
        }
      }
      else{
        if(storages[storagesize - 1].addToPool(pubKeyTd, pubKeyFile, msg.sender, hashtag)){
          FileStored(true, storagesize, pubKeyFile);
        }
        else{
          FileStored(false, storagesize, pubKeyFile);
        }
      }
    //}
  }

  function getStorageNode(uint32 i, uint32 j, uint32 k, uint32 l) constant public returns(address ){
    return storages[i].getStorageNode(j, k, l);
  }

  function getFromPool(bytes seed, address pubKeyValidator) view public returns(address Storage, address trustedDealer, bytes32 file){
    address _trustedDealer;
    bytes32 _file;
    uint32 i = uint32(keccak256(seed, pubKeyValidator, now, msg.sender)) % storagesize;
    (_trustedDealer, _file) = storages[i].getFromPool(seed, pubKeyValidator, msg.sender, i);
    return (storages[i], _trustedDealer, _file);
  }
}
