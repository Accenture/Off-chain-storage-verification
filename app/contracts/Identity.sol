pragma solidity ^0.4.19;
import "Constants.sol";

contract Identity {
  Constants constants;
  uint32 m;

  event TrustedDealerAdded(
    string msgEndPoint,
    address indexed ethAddress);

  event StorageNodeAdded(
      string msgEndPoint,
      address indexed ethAddress);

  event ValidatorAdded(
    string msgEndPoint,
    address indexed ethAddress);
/* Defining the structres for the 3 different types of network participants*/
  struct Party{
    string msgEndPoint;
    address ethAddress;
  }
  Party[] trustedDealers;
  Party[] storageNodes;
  Party[] validators;
/*Constructor*/
  function Identity(Constants _constants) public{
    constants = _constants;
    m = constants.getM();
  }

  function addTrustedDealer(string  _msgEndPoint, address  _ethAddress) public returns(bool ) {
    for(uint32 i = 0; i < trustedDealers.length; i++){
      if(trustedDealers[i].ethAddress == _ethAddress){
        return false;
      }
    }
    trustedDealers.push(Party({
                                        msgEndPoint: _msgEndPoint,
                                        ethAddress: _ethAddress
    }));
    TrustedDealerAdded(_msgEndPoint, _ethAddress);
    return true;
  }

  function addStorageNode(string  _msgEndPoint, address  _ethAddress) public returns(bool ) {
    for(uint32 i = 0; i < storageNodes.length; i++){
      if(storageNodes[i].ethAddress == _ethAddress){
        return false;
      }
    }
    storageNodes.push(Party({
                                        msgEndPoint: _msgEndPoint,
                                        ethAddress: _ethAddress
    }));
    StorageNodeAdded(_msgEndPoint, _ethAddress);
    return true;
  }

  function addValidator(string  _msgEndPoint, address  _ethAddress) public returns(bool ) {
    for(uint32 i = 0; i < validators.length; i++){
      if(validators[i].ethAddress == _ethAddress){
        return false;
      }
    }
    validators.push(Party({
                                        msgEndPoint: _msgEndPoint,
                                        ethAddress: _ethAddress
    }));
    ValidatorAdded(_msgEndPoint, _ethAddress);
    return true;
  }

// Getters for the network participants
  function getTrustedDealer(address ethAdd) view public returns(string, address){
    for(uint32 i=0; i<trustedDealers.length; i++ ){
      if (trustedDealers[i].ethAddress == ethAdd){
        return (trustedDealers[i].msgEndPoint, trustedDealers[i].ethAddress);
      }
    }
    return;
  }

  function getStorageNode(address ethAdd) view public returns(string, address){
    for(uint32 i=0; i<storageNodes.length; i++ ){
      if (storageNodes[i].ethAddress == ethAdd){
        return (storageNodes[i].msgEndPoint, storageNodes[i].ethAddress);
      }
    }
    return;
  }

  function getValidator(address ethAdd) view public returns(string, address){
    for(uint32 i=0; i<validators.length; i++ ){
      if (validators[i].ethAddress == ethAdd){
        return (validators[i].msgEndPoint, validators[i].ethAddress);
      }
    }
    return;
  }

  function isTrustedDealer(address ethAdd) view public returns(bool ){
    for(uint32 i=0; i<trustedDealers.length; i++ ){
      if (trustedDealers[i].ethAddress == ethAdd){
        return true;
      }
    }
    return false;
  }

  function isStorageNode(address ethAdd) view public returns(bool){
    for(uint32 i=0; i<storageNodes.length; i++ ){
      if (storageNodes[i].ethAddress == ethAdd){
        return true;
      }
    }
    return false;
  }

  function isValidator(address ethAdd) view public returns(bool ){
    for(uint32 i=0; i<validators.length; i++ ){
      if (validators[i].ethAddress == ethAdd){
        return true;
      }
    }
    return false;
  }

  function getValidatorFromIndex(uint32 index) view public returns(address ){
    if (index <= validators.length && index >= 0){
        return validators[index].ethAddress;
    }
  }

  function getStorageNodeFromIndex(uint32 index) view public returns(address ){
      if (index <= storageNodes.length && index >= 0){
          return storageNodes[index].ethAddress;
      }
  }

  function getTrustedDealerFromIndex(uint32 index) view public returns(address ){
    if (index <= trustedDealers.length && index >= 0){
        return trustedDealers[index].ethAddress;
    }
  }

// Getter for the number of participants for each possible way to get to the network

  function getTdNb() constant public returns (uint32 ){
    return uint32(trustedDealers.length);
  }
  function getSnNumber() constant public returns (uint32 ){
    return uint32(storageNodes.length);
  }
  function getValNb() constant public returns (uint32 ){
    return uint32(validators.length);
  }
}
