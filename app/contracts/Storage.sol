pragma solidity ^0.4.19;
import "Constants.sol";
import "Identity.sol";

contract Storage {
  Identity identity;
  Constants constants;

  struct File{
    bytes32 pubKey;
    mapping(address => uint32[]) hashtags;
    address[] storageNodes;
  }

  //event FileStored(bool stored, uint32 files, bytes32 filename);

  struct TrustedDealer{
    address pubKey;
    mapping(uint32 => File) files;
    uint32 filesize;
  }

  uint32[] _hashtags;
  address[] _sn;
  File _file;
  File[] _files;
  TrustedDealer _td;
  TrustedDealer[] storageMap;
  //uint32[] indexSelected;
  //address[] snSelected;

  function Storage(Identity _identity, Constants _constants) public{
    identity = _identity;
    constants = _constants;
  }

  function isStorageFull(address pubKeyTd, bytes32 pubKeyFile, address pubKeySn) view public returns (bool){
    if (storageMap.length == 5){
      return true;
    }
    for (uint32 i=0; i<storageMap.length; i++){
      if (storageMap[i].pubKey == pubKeyTd){
        if (storageMap[i].filesize == 4) {
          return true;
        }
        for (uint32 j=0; j<(storageMap[i].filesize + 1); j++){
          if (storageMap[i].files[j].pubKey == pubKeyFile){
            if (storageMap[i].files[j].storageNodes.length == 5){
              return true;
            }
            if (storageMap[i].files[j].hashtags[pubKeySn].length == 100){
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  function addToPool(address pubKeyTd, bytes32 pubKeyFile, address pubKeySn, uint32 hashtag) public returns (bool){
    // Checking if the trustedDealer referred too is already on the map if not creates a structure for it put it on the map and returns true
    for (uint32 i=0; i<storageMap.length; i++){
      if (storageMap[i].pubKey == pubKeyTd){
        // Checking if the file is already on the map if no creates a structure for it and returns true
        for (uint32 j=0; j<(storageMap[i].filesize + 1); j++){
          if (storageMap[i].files[j].pubKey == pubKeyFile){
            if (storageMap[i].files[j].hashtags[pubKeySn].length != 0){
              for (uint32 k = 0; k < storageMap[i].files[j].hashtags[pubKeySn].length; k++){
                if (storageMap[i].files[j].hashtags[pubKeySn][k] == hashtag){
                  //FileStored(false, storageMap[i].filesize, storageMap[i].files[j].pubKey);
                  return false;
                }
              }
              storageMap[i].files[j].hashtags[pubKeySn].push(hashtag);
              //FileStored(true, storageMap[i].filesize, storageMap[i].files[j].pubKey);
              return true;
            }
            else{
              storageMap[i].files[j].storageNodes.push(pubKeySn);
              _hashtags = [hashtag];
              storageMap[i].files[j].hashtags[pubKeySn] = _hashtags;
              //FileStored(true, storageMap[i].filesize, storageMap[i].files[j].pubKey);
              return true;
            }
          }
        }
        _sn = [pubKeySn];
        _file = File({pubKey: pubKeyFile, storageNodes: _sn});
        _hashtags = [hashtag];
        _file.hashtags[pubKeySn] = _hashtags;
        storageMap[i].filesize = storageMap[i].filesize + 1;
        storageMap[i].files[storageMap[i].filesize] = _file;
        //FileStored(true, storageMap[i].filesize, storageMap[i].files[storageMap[i].filesize].pubKey);
        return true;
      }
    }
    _sn = [pubKeySn];
    _file = File({pubKey: pubKeyFile, storageNodes: _sn});
    _hashtags = [hashtag];
    _td = TrustedDealer({pubKey: pubKeyTd, filesize: 0});
    storageMap.push(_td);
    storageMap[storageMap.length - 1].files[storageMap[storageMap.length - 1].filesize] = _file;
    storageMap[storageMap.length - 1].files[storageMap[storageMap.length - 1].filesize].hashtags[pubKeySn] = _hashtags;
    //FileStored(true, storageMap[storageMap.length - 1].filesize, storageMap[storageMap.length - 1].files[storageMap[storageMap.length - 1].filesize].pubKey);
    return true;
  }

  function getStorageNode(uint32 i, uint32 j, uint32 k) constant public returns(address ){
    return storageMap[i].files[j].storageNodes[k];
  }

  function getFromPool(bytes seed, address pubKeyValidator, address validation, uint32 idx) view public returns(address trustedDealer, bytes32 file){
    uint32 i = uint32(keccak256(seed, pubKeyValidator, now, validation, idx))% uint32(storageMap.length);
    uint32 j = uint32(keccak256(seed, pubKeyValidator, now, validation, idx, i))%(storageMap[i].filesize + 1);
    return (storageMap[i].pubKey, storageMap[i].files[j].pubKey);
  }
}
