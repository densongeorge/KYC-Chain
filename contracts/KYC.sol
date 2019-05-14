pragma solidity ^0.4.18;



contract KYC{
    //events

    event isAdminEvent(address indexed sender,bool status,string msg);
    
   // event isBankEvent(address indexed sender,bool status,string msg);

    event noSuchBankEvent(address indexed sender,bool status,string msg);

    event noSuchUserEvent(address indexed sender,bool status,string msg);

    event invalidBankEvent(address indexed sender,bool status,string msg);
     event invalidUserEvent(address indexed sender,bool status,string msg);
     
     uint timeout=60;//seconds
    //state variables
    struct Bank{
        string name;
        address id;
        string email;
        uint uninit;
     //   string publickey;
    }
   Bank[] Banks;
   uint bankscount;

    struct UserDetails{
        string firstName;
        string lastName;
        string dateOfBirth;
        string aadharNo;
        string email;
        string mobileNo;
       uint lastModified;
     //   uint valid;
    }

    struct LastUpdate{
        address id; //bank address
        bytes sign; //signed hash is present here.
        bytes hashmessage;
    }

    struct User{
        address id;
   //     string KYCID;
        UserDetails [] details;
     // no need of index pointing to last modified user data!
        mapping(address => string)  ACL; // holds list of bank addresses and the names as values
        LastUpdate lu;
        uint np;
    }
     mapping(address => User) users;

     //mapping of user and  aadhar for validation purposes
    mapping(string => address) useraadhar;
  
    uint userscount;

    struct Verifier{
        address Id;
        address bankId;
    }

    struct Admin{
     address Id;
    }

      Admin a;

   // mapping(address=>string) bankIdToPublickey;
    
  
    // Constructor
function KYC() public {
    a.Id = 0x7fbFf5D4496fD3539C9a73Ea54280982cA13E9E3;
}

function getAdminID() public view returns (
    address _id
){
    return( a.Id);
}
function isAdmin(address _addr) public constant returns (bool){
    return _addr==a.Id;
}
modifier isadmin(){
    if(isAdmin(msg.sender)){
        _;
    }
    else{
        isAdminEvent(msg.sender,false,"Sender not registered as admin");
    }
}

function isBank(address _addr)  public constant returns (bool){
    uint flag=0;
for(uint i=0;i<Banks.length;i++)
{
    
    if(Banks[i].id == _addr)
    {
        flag=1;
    }
}
if(flag==1)
return true;

return false;
}


//modifier for bank

modifier isbank()
{
    if(isBank(msg.sender))
    {
        _;
    }
    else{
        noSuchBankEvent(msg.sender,false,"Sender not registered as bank");
    }
}

//returns false when user is not registered
//true when user is registered
function isalreadyRegisteredUser(string _aadharNo) public returns(bool)
{
    if(useraadhar[_aadharNo]==0x0000000000000000000000000000000000000000)
    {
        return false;
    }
    else{
        return true;
    }
}

function updateKYC( string _firstName,
        string _lastName,
        string _dateOfBirth,
        string _aadharNo,
        string _email,
        string _mobileNo,bytes _sign,bytes _hashmessage, address _useraddress) public isbank

        {
            uint time=now;
            UserDetails memory d = UserDetails(_firstName,_lastName,_dateOfBirth,_aadharNo,_email,_mobileNo,time);
            var (name,,)=getBank(msg.sender);
              users[_useraddress].ACL[msg.sender]=name;
               LastUpdate memory l = LastUpdate(msg.sender,_sign,_hashmessage);
        users[_useraddress].details.push(d);
        users[_useraddress].lu=l;
        users[_useraddress].np=10;
        userscount++; 
        useraadhar[_aadharNo]=_useraddress;
        users[_useraddress].id=_useraddress;
       
        }




//function registerBank(string _name,address _id,string _email,string _publickey) public isadmin
function registerBank(string _name,address _id,string _email) public isadmin
{
    Bank memory bank = Bank(_name, _id, _email,10);
    Banks.push(bank);
    bankscount++;
}

function gethash(address user_add) public returns(address,bytes,bytes){

    //if(isValidUser(user_add))
    //{
        return(users[user_add].lu.id,users[user_add].lu.sign,users[user_add].lu.hashmessage);
   // }
   // else
   // {
    //   noSuchUserEvent(user_add,false,"Id provided is not registered as a user"); 
   // }

}

//validation for user already exist in the system is pending
function registerUser( string _firstName,
        string _lastName,
        string _dateOfBirth,
        string _aadharNo,
        string _email,
        string _mobileNo,bytes _sign,bytes _hashmessage, address _useraddress) public isbank
{
   
uint time=now;
    UserDetails memory d = UserDetails(_firstName,_lastName,_dateOfBirth,_aadharNo,_email,_mobileNo,time);
      var (name,,)=getBank(msg.sender);
              users[_useraddress].ACL[msg.sender]=name;
    LastUpdate memory l = LastUpdate(msg.sender,_sign,_hashmessage);
    users[_useraddress].details.push(d);
    users[_useraddress].lu=l;
    users[_useraddress].id=_useraddress;
    users[_useraddress].np=10;
    userscount++;
    useraadhar[_aadharNo]=_useraddress;
    

}
//validation function for getUserforBank

    

function isValidBank(address _bankid,address _useraddress) public view returns (bool){
    uint flag=0;

    bytes memory bname=bytes(users[_useraddress].ACL[_bankid]);
 
        if( bname.length == 0 )
        {
            flag=1;

        }
    
    if(flag==1)
    {
        return false;
    }
    return true;
}


function getLastModified(address _userid) public returns(uint)
{
    uint index= users[_userid].details.length-1;
   uint val=users[_userid].details[index].lastModified;
           return(val*1000);
}

// function updateUserFlag(address _userid) public returns(uint)
// {
//     uint index= users[_userid].details.length-1;
//             return(users[_userid].details[index].valid);
//      //  return(10);
// }


//getter for user details for a bank 
function getUserforBank(address _userid) public  returns(
  string firstName,string lastName,
        string dateOfBirth,
        string aadharNo,
        string email,
        string mobileNo)//,address acllast,address lubank)
        {

            if(isValidBank(msg.sender,_userid))
            {
            if(users[_userid].np<1)
            {
              noSuchUserEvent(msg.sender,false,"User not recognized ");   
            }
             }
             else
             {
                invalidBankEvent(msg.sender,false,"Invalid Bank");
             }
            uint index= users[_userid].details.length-1;
            return(users[_userid].details[index].firstName,
            users[_userid].details[index].lastName,
            users[_userid].details[index].dateOfBirth,
            users[_userid].details[index].aadharNo,
            users[_userid].details[index].email,
            users[_userid].details[index].mobileNo
          //  users[_userid].ACL[users[_userid].ACL.length-1],
          //  users[_userid].lu.id
          );
}



function isValidUser(address _userid) public returns(bool)
{
    // if(users[_userid].np < 1)
    // {
    // noSuchUserEvent(msg.sender,false,"User not recognized ");
    // return false;   
    // }
    // else{
       if(users[_userid].id == _userid)
        {
           
             return true;
        }

        else
        {
        return false;
        }
    }




modifier isvaliduser()
{
    if(isValidUser(msg.sender))
    {
        _;
    }
    else
    {
      invalidUserEvent(msg.sender,false,"Invalid User");
    }

}
function getUserforUser(address _userid) public returns(
    string firstName,string lastName,
    string dateOfBirth,
    string aadharNo,
    string email,
    string mobileNo){
        return(users[_userid].details[users[_userid].details.length-1].firstName,
        users[_userid].details[users[_userid].details.length-1].lastName,
        users[_userid].details[users[_userid].details.length-1].dateOfBirth,
        users[_userid].details[users[_userid].details.length-1].aadharNo,
        users[_userid].details[users[_userid].details.length-1].email,
        users[_userid].details[users[_userid].details.length-1].mobileNo
        //  users[_userid].ACL[users[_userid].ACL.length-1],
        //  users[_userid].lu.id
        );
} 
//getter for bank

function getBank(address _id) public returns (
    string name,
    address id,
    string email
){
    //please send only valid bank ids here.
    uint flag=0;
    uint i=0;
    for(i=0;i<Banks.length;i++){
        if(Banks[i].id==_id){
            flag=1;
            break;
        }
    }
    if(flag==0){
        noSuchBankEvent(_id,false,"Id provided is not registered as a bank");
        return(" ",0x7fbFf5D4496fD3539C9a73Ea54280982cA13E9E3 , " ");
    }
    return(Banks[i].name, Banks[i].id, Banks[i].email);
  }


function addACL(string _name,address uid) public returns(bool){
    uint flag=0;
    uint i=0;
    for(i=0;i<Banks.length;i++){
        if(keccak256(Banks[i].name)==keccak256(_name)){
            flag=1;
            break;
        }
    }
    if(flag==1)
    {
    users[uid].ACL[Banks[i].id]=_name;
    return true;
    }
    else{
        return false;

    }


}

function alreadyExistingBank (string _name )public returns(bool){
uint flag=0;
    uint i=0;
    for(i=0;i<Banks.length;i++) 
    {
        if(keccak256(Banks[i].name)==keccak256(_name)){
            flag=1;
            break;
        }
    }
   if(flag==1)
   return true;
   else
   return false;


}




}

