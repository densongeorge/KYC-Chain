pragma solidity ^0.4.21;
contract eth2fa {

    event registerDeviceEvent(address indexed sender,bool status,string msg);
    event registerUserEvent(address indexed sender,bool status,string msg);
    event requestSystemAccessEvent(address indexed sender,bool status,string msg);
    event approveSystemRequestEvent(address indexed sender,bool status,string msg);
    event unlockSystemEvent(address indexed sender,bool status);
    event generateOTPEvent(address indexed sender,bool status,string msg);
    event isUserEvent(address indexed sender,bool status,string msg);
    event isStaffEvent(address indexed sender,bool status,string msg);

    struct userToken{
        bytes32[] tokens;
    }

    struct System{
        string name;
        address id;
        address[] allowedUser;
        bool isRevoked;
        bytes32[] specialTokens;
        mapping (address=> userToken) userTokens;
    }

    mapping(address => System) systems;

    struct User{
      string name;
      address id;
      address[] systemList;
    }
    mapping(address => User) users;

    struct Staff{
      string name;
      address id;
    }
    mapping(address=>Staff) staffs;

    struct DevRequest{
      address user_id;
      address system_id;
    }

    DevRequest[] requests;

    address[] globalSystemList;
    address[] globalUserList;
    address[] globalStaffList;
    address owner;

    function  eth2fa() public {
      staffs[msg.sender].name="Owner";
      staffs[msg.sender].id=msg.sender;
      globalStaffList.push(msg.sender);
      owner=msg.sender;
    }

    function userExist(address addr) public constant returns (bool){
      return bytes(users[addr].name).length !=0;
    }

    function staffExist(address addr) public constant returns (bool){
      return bytes(staffs[addr].name).length !=0;
    }

    function systemExist(address addr) public constant returns (bool){
      return bytes(systems[addr].name).length !=0;
    }

    modifier isUser(){
      if(userExist(msg.sender)){
        _;
      }else{
        isUserEvent(msg.sender,false,"Sender not registered as user");
      }
    }

    modifier isStaff(){
      if(staffExist(msg.sender)){
        _;
      }else{
        isStaffEvent(msg.sender,false,"Sender not registered as staff");
      }
    }

    modifier isSystem(){
      if(systemExist(msg.sender)){
        _;
      }
    }

    //Staff Functions
    function registerDevice(string name, address addr) public isStaff returns(bool,string){
      if(systemExist(addr)){
        registerDeviceEvent(msg.sender,false,"Device already registered.");
        return(false,"Device already registered.");
      }else{
          systems[addr].name=name;
          systems[addr].id=addr;
          systems[addr].isRevoked=false;
          globalSystemList.push(addr);
          registerDeviceEvent(msg.sender,true,"Device registered");
          return(true,"Device registered");
      }
    }

    function registerUser(string name, address addr) public isStaff returns(bool,string){
      if(userExist(addr)){
        registerUserEvent(msg.sender,false,"User already registered.");
        return(false,"User already registered.");
      }else{
        users[addr].name=name;
        users[addr].id=addr;
        globalUserList.push(addr);
        registerUserEvent(msg.sender,true,"User registered.");
        return(true,"User registered.");
      }
    }

    function approveSystemRequest(uint index) public isStaff returns(bool,string){
      if(index<requests.length){
        address user_id = requests[index].user_id;
        address system_id = requests[index].system_id;

        systems[system_id].allowedUser.push(user_id);
        // systems[systems_id].userTokens[user_id];
        users[user_id].systemList.push(system_id);
        delete requests[index];
        approveSystemRequestEvent(msg.sender,true,"Request approved");
        return(true,"Request approved");
        }else{
          approveSystemRequestEvent(msg.sender,false,"Request number does not exist.");
          return(false,"Request number does not exist.");
        }
    }

    function unlockSystem(address addr) public isStaff returns(bool){
      systems[addr].isRevoked=false;
      unlockSystemEvent(msg.sender,true);
      return true;
    }

    function getCurrentUserRequests() public constant isStaff returns(uint[],address[],address[]){
      address[] memory requestorAddress = new address[](requests.length);
      address[] memory systemAddress = new address[](requests.length);
      uint[] memory requestIndex = new uint[](requests.length);
      for (uint i=0;i<requests.length;i++){
        requestorAddress[i] = requests[i].user_id;
        systemAddress[i] = requests[i].system_id;
        requestIndex[i]=i;
      }
      return (requestIndex,requestorAddress,systemAddress);
    }

    function getSystemList() public constant returns(bytes32[],address[]){
      bytes32[] memory systemNames = new bytes32[](globalSystemList.length);
      address[] memory systemsAddress = new address[](globalSystemList.length);

      for (uint i=0;i<globalSystemList.length;i++){
        systemNames[i]=stringToBytes32(systems[globalSystemList[i]].name);
        systemsAddress[i]=systems[globalSystemList[i]].id;
      }
      return(systemNames,systemsAddress);
    }

    function getUserList() public constant returns(bytes32[],address[]){
      bytes32[] memory userNames = new bytes32[](globalUserList.length);
      address[] memory userAddress = new address[](globalUserList.length);

      for (uint i=0;i<globalUserList.length;i++){
        userNames[i]=stringToBytes32(users[globalUserList[i]].name);
        userAddress[i]=users[globalUserList[i]].id;
      }
      return(userNames,userAddress);
    }



    function getUsersOfSystem(address addr) public constant isStaff returns(address[], bytes32[]){
      bytes32[] memory userNames = new bytes32[](systems[addr].allowedUser.length);
      for (uint i=0;i<systems[addr].allowedUser.length;i++){
        userNames[i]=stringToBytes32(getUserName(systems[addr].allowedUser[i]));
      }
      return(systems[addr].allowedUser,userNames);
    }

    function getRevokedSystemList() public constant returns(bytes32[],address[]){
      bytes32[] memory systemNames = new bytes32[](globalSystemList.length);
      address[] memory systemsAddress = new address[](globalSystemList.length);
      for (uint i=0;i<globalSystemList.length;i++){
        if(systems[globalSystemList[i]].isRevoked){
          systemNames[i]=stringToBytes32(systems[globalSystemList[i]].name);
          systemsAddress[i]=systems[globalSystemList[i]].id;
        }
      }
      return(systemNames,systemsAddress);
    }

    // User functions
    function isUserAllowedForSystem(address user_addr,address system_addr) internal view returns (bool){
      for(uint i=0;i<systems[system_addr].allowedUser.length;i++){
        if(user_addr==systems[system_addr].allowedUser[i]){
          return true;
        }
      }
      return false;
    }

    function requestSystemAccess(address addr) public isUser returns(bool,string){
      if(systemExist(addr)){
        requests.push(DevRequest(msg.sender,addr));
        requestSystemAccessEvent(msg.sender,true,"Request added");
        return(true,"Request added");
        }else{
          requestSystemAccessEvent(msg.sender,false,"System does not exist.");
          return(false,"System does not exist.");
        }
    }

    function generateOTP(address system_addr,bytes32 hash) public isUser returns(bool,string){
      if(isUserAllowedForSystem(msg.sender,system_addr)){
        systems[system_addr].userTokens[msg.sender].tokens.push(hash);
        generateOTPEvent(msg.sender,true,"token saved");
        return(true,"token saved");
        }else{
          generateOTPEvent(msg.sender,false,"User not allowed");
          return(false,"User not allowed");
        }
    }

    function getMySystemList() public constant isUser returns(bytes32[],address[],uint[]){
      bytes32[] memory systemNames = new bytes32[](users[msg.sender].systemList.length);
      address[] memory systemsAddress = new address[](users[msg.sender].systemList.length);
      uint[] memory tokenCount = new uint[](users[msg.sender].systemList.length);
      for(uint i=0;i<users[msg.sender].systemList.length;i++){
        systemNames[i]=stringToBytes32(getSystemName(users[msg.sender].systemList[i]));
        systemsAddress[i]=users[msg.sender].systemList[i];
        tokenCount[i] = systems[users[msg.sender].systemList[i]].userTokens[msg.sender].tokens.length;
      }
      return(systemNames,systemsAddress,tokenCount);
    }

    //System functions

    function getTokenList() public constant isSystem returns (bytes32[]){
      uint tokenCount=0;
      for(uint t=0;t<systems[msg.sender].allowedUser.length;t++){
        address tmp_curr_user = systems[msg.sender].allowedUser[t];
        tokenCount=tokenCount+systems[msg.sender].userTokens[tmp_curr_user].tokens.length;
      }
      tokenCount=tokenCount+systems[msg.sender].specialTokens.length;

      bytes32[] memory tokenList = new bytes32[](tokenCount);

      uint token_index=0;
      for(uint i=0;i<systems[msg.sender].allowedUser.length;i++){
        address curr_user = systems[msg.sender].allowedUser[i];
        for(uint j=0;j<systems[msg.sender].userTokens[curr_user].tokens.length;j++){
          tokenList[token_index]=systems[msg.sender].userTokens[curr_user].tokens[j];
          token_index=token_index+1;
        }
      }
      for (uint k=0;i<systems[msg.sender].specialTokens.length;k++){
        tokenList[token_index]=systems[msg.sender].specialTokens[k];
        token_index=token_index+1;
      }
      return tokenList;
    }

    function useToken(bytes32 hash) public isSystem returns (bool){
      for(uint i=0;i<systems[msg.sender].allowedUser.length;i++){
        address curr_user = systems[msg.sender].allowedUser[i];
        for(uint j=0;j<systems[msg.sender].userTokens[curr_user].tokens.length;j++){
          if(hash == systems[msg.sender].userTokens[curr_user].tokens[j]){
            delete systems[msg.sender].userTokens[curr_user].tokens[j];
            return true;
          }
        }
      }
      for(uint k=0;j<systems[msg.sender].specialTokens.length;k++){
        if(hash == systems[msg.sender].specialTokens[k]){
          return true;
        }
      }
      return false;
    }

    function isSystemRevoked() public constant returns(bool){
      if(systems[msg.sender].isRevoked){
          return true;
        }else{
          return false;
        }
    }

    function lockSystem() public isSystem{
      systems[msg.sender].isRevoked=true;
    }

    //Misc functions

    function getSystemName(address addr) public constant returns(string){
      return systems[addr].name;
    }

    function getUserName(address addr) public constant returns(string){
      return users[addr].name;
    }

    function stringToBytes32(string memory source) internal returns (bytes32 result) {
      assembly {
          result := mload(add(source, 32))
      }
    }

}