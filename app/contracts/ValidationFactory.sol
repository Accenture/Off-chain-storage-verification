pragma solidity ^0.4.19;
import "Constants.sol";
import "Identity.sol";
import "Validation.sol";
import "StorageFactory.sol";

contract ValidationFactory {
  Constants constants;
  Identity identity;
  StorageFactory sfactory;
  Validation[] validations;

  event ValidatorElected(
    address indexed validator,
    address validation);

  function ValidationFactory(Identity _identity, Constants _constants, StorageFactory _sfactory) public {
    constants =  _constants;
    identity = _identity;
    sfactory = _sfactory;
    validations.push(Validation(0x0000000000000000000000000000000000000000));
  }
  /*This function refers to the Elect function from the original paper*/
  function elect(bytes seed) view private returns (address ){
    uint32 i = uint32(keccak256(seed, now, validations[validations.length - 1])) % (identity.getValNb());
    return identity.getValidatorFromIndex(i);
  }

  function init(bytes seed) public {
    address elected = elect(seed);
    validations.push(new Validation(elected, validations[validations.length - 1], sfactory, constants, identity, seed));
    ValidatorElected(elected, address(validations[validations.length - 1]));
  }

}
