pragma solidity ^0.4.19;
import "Identity.sol";
import "Constants.sol";
import "StorageFactory.sol";
import "Validation.sol";
import "ValidationFactory.sol";


contract Root {

    Constants _constants;
    Identity _identity;
    StorageFactory _storageFactory;
    ValidationFactory _validationFactory;

    // Constructor
    function Root (uint32 k ,uint32 n ,uint32 l, uint32 m, uint32 p) public payable {
      _constants = new Constants(k, n, l, m, p);
      _identity = new Identity(_constants);
      _storageFactory = new StorageFactory(_identity, _constants);
      _validationFactory = new ValidationFactory(_identity, _constants, _storageFactory);
    }

    //Get functions for the contracts deployed by Root
    function getConstants() constant public returns (Constants ){
      return _constants;
    }

    function getIdentity() constant public returns (Identity ){
      return  _identity;
    }
    function getStorageFactory() constant public returns (StorageFactory ){
      return  _storageFactory;
    }

    function getValidationFactory() constant public returns (ValidationFactory ){
      return _validationFactory;
    }

}
