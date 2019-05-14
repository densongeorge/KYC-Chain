App = {
     web3Provider: null,
     contracts: {},
     account:0x0,
     KYC:null,

    init: function() {


          /*
           * Replace me...
           */
           /*var articlesRow = $('#articlesRow');
           var articleTemplate = $('#articleTemplate');
           articleTemplate.find('.panel-title').text("article 1");
           articleTemplate.find('.article-description').text('Description For Article 1');
           articleTemplate.find('.article-price').text("10.23");
           articleTemplate.find('.article-seller').text("0x12345678901234567890");

           articlesRow.append(articleTemplate.html()) Adding Article template to article Row */
          return App.initWeb3();
     },

    initWeb3: function() {
          /*
           * Replace me...
           */
           if(window.ethereum){
             window.web3 = new Web3(ethereum);
             $('#need-metamask').hide();
           }else{
             console.log('Install Metamask');
             return ;
           }


           if(typeof web3 !== 'undefined'){
               //
               App.web3Provider = web3.currentProvider;
           }else{
               App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
           }


           try{
             ethereum.enable();
             $('#need-enable').hide();
           }catch(error){
             console.log('Error : Enable Account Access And Reload');
             return;
           }



           web3 = new Web3(App.web3Provider);


           App.displayAccountInfo();

          return App.initContract();
     },

    displayAccountInfo : function() {
     //  acc = web3.eth.getAccounts();
     //  web3.eth.defaultAccount = acc[0];

         web3.eth.getCoinbase(function(err,account){
             if(err === null){
                 App.account = account;
                 $('#account').text(account);
                 web3.eth.getBalance(account,function(err,balance){
                     if(err === null){
                         $('#accountBalance').text(web3.utils.fromWei(balance,"ether") + " ETH");
                     }
                 })
             }
         });

     },
    
    initContract: function() {
          /*
           * Replace me...
           */
           $.getJSON('KYC.json',function(kycArtifact){
               // get the contract artifact file and use it to instantiate a truffle contract abstraction

              // App.contracts.KYC = TruffleContract(kycArtifact);
              //App.contracts.KYC = new web3.eth.Contract(kycArtifact['abi'],'0x68b37712E56a36C147d88c51521a25b2E7C4CE35');//contract address
              //App.contracts.KYC = new web3.eth.contracts
               // set the provider for our contracts
               KYC = new web3.eth.Contract(kycArtifact['abi'],'0x68b37712E56a36C147d88c51521a25b2E7C4CE35');//
               KYC.setProvider(App.web3Provider);
               //App.contracts.KYC.setProvider(App.web3Provider);
               // retrieve the article from the contract

               App.listenToEvents();
               //listen to event 

               return App.initAdmin();
           });

    },
    initAdmin:function() {

        App.contracts.KYC.deployed().then(function(instance){
            return instance.getAdminID();
        }).then(function(admin)
        {
            console.log(admin);
        }
        
        )
        return App.registerBank();

    },

    registerBank : function()
    {
        var _name="SBI";
        var _id=0x7fbFf5D4496fD3539C9a73Ea54280982cA13E9E3; // put account address here
        var _email="sbi@co.in";
        var _publickey="7yt23r8g8gr387grh3d7831y";
        App.contracts.KYC.deployed().then(function(instance){
            web3.eth.accounts.create().then(function(account){
                var privatekey=account.privateKey;
                console.log(account.privateKey);
                console.log(account.address);
            instance.registerBank(_name,account.address,_email,_publickey);
            return instance;
            })    
        }).then(function(instance)
        {
            return instance.getBank(account.address);
        }
        
        ).then(function(bank)
        {
            console.log(bank[0]);
            console.log(bank[1]);
            console.log(bank[2]);
            console.log(bank[3]);

        } ) ;
    },
    reloadArticles : function(){
        //refresh the account information because the balance might have changed
        App.displayAccountInfo();

        // retrieve the article placeholder and clear it

        $('#articlesRow').empty();
        App.contracts.ChainList.deployed().then(function(instance){
            return instance.getArticle();
        }).then(function(article){
            //console.log("This should print" + article[0]);
            if(article[0] == 0X0){
                //no article to display
                return;
            }
            // retrieve the article template and fill it
            //console.log("This should print" + article[4]);
            var price = web3.fromWei(article[4],'ether');
            //console.log("Price is " + price);
            var articleTemplate = $('#articleTemplate');
            articleTemplate.find('.panel-title').text(article[2]);
            articleTemplate.find('.article-description').text(article[3]);
            articleTemplate.find('.article-price').text(price);
            articleTemplate.find('.btn-buy').attr('data-value',price);
            //articleTemplate.find('.article-seller').text("0x12345678901234567890");


            var seller = article[0];
            if(seller == App.account){
                seller = "You";
            }
            articleTemplate.find('.article-seller').text(seller);

            var buyer = article[1];
            if(buyer== App.account){
                buyer = "You";
            }else if(buyer == 0x0){
                buyer = "No One Yet";
            }
            articleTemplate.find('.article-buyer').text(buyer);

            if(App.account == article[0] || article[1]!=0x0){
                articleTemplate.find('.btn-buy').hide();
            }else{
                articleTemplate.find('.btn-buy').show();
            }


            //add this to article
            $('#articlesRow').append(articleTemplate.html());

        }).catch(function(err){
            console.error(err.message);
        });



    },
    sellArticle : function() {
        // retrieve the details of the article
        var _article_name = $('#article_name').val();
        var _description = $('#article_description').val();
      //  var _price = web3.toWei(parseFloat($('#article_price').val() || 0),"ether");
      var _price = 10;

        if((_article_name.trim() == "") || (_price == 0)){
            return false;
        }

        App.contracts.ChainList.deployed().then(function(instance){
            return instance.sellArticle(_article_name,_description,_price,{
                from : App.account,
                gas : 500000
            });
        }).then(function(result){
            //App.reloadArticles();
        }).catch(function(err){
            console.error(err);
        });
    },

    listenToEvents : function(){
        // App.contracts.ChainList.deployed().then(function(instance){
        //     instance.LogSellArticle({},{}).watch(function(error,event){
        //         if(!error){
        //             $("#events").append('<li class = "list-group-item">' + event.args._name + 'is now for sale </li>');
        //         }else{
        //             console.error(error);
        //         }
        //         App.reloadArticles()
        //     });

        //     instance.LogBuyArticle({},{}).watch(function(error,event){
        //         if(!error){
        //             $("#events").append('<li class = "list-group-item">' + event.args._buyer + ' bought ' + event.args._name + '</li>');
        //         }else{
        //             console.error(error);
        //         }
        //         App.reloadArticles()
        //     });

        // });
        //App.contracts.KYC.getArticle();
        // var a=KYC.getAdminID();
        // App.contracts.KYC.deploy().then(function(instance){
        //     instance.isAdminEvent({}, {toBlock: 'latest'}).watch(function(error,event){
        //             if(!error)
        //             {
        //                 console.log("status:"+event.args.status+" msg:"+event.args.msg)
                      
        //             }
        //             else{
        //                 console.log("is admin event failed");
        //             }

        //     });
        // });

        // const web3 = getWeb3()
        // const getInstance = getContractInstance(web3)
        // const myContract = getInstance("KYC")
        // myContract.methods.getAdminID();




    },

    buyArticle : function(){
        event.preventDefault();
        //retrive the article price
        //event.target is the button
        var price = parseFloat($(event.target).data('value'));

        App.contracts.ChainList.deployed().then(function(instance){
            return instance.buyArticle({
                from : App.account,
                value : web3.toWei(price,"ether"),
                gas : 500000
            });
        }).catch(function(error){
            console.error(error);
        });
    }


};

var adminid='0x7fbFf5D4496fD3539C9a73Ea54280982cA13E9E3';
curraccount=null;
kyc = null;
const contractAddress = '0xe10071cE0Bd246Fc60e0430209cd119391ba019b';

function UserKYCAuth(){
    var _bank_name = $('#bank_name').val();
    kyc.methods.alreadyExistingBank(_bank_name).call().then(function(obj){
        if(obj==true){
            kyc.methods.addACL(_bank_name,curraccount).send({from : curraccount,
                gas : 500000}).then(function(){
                alert(_bank_name + "Bank got access to your data");
            })
        }else{
            alert("Bank Does Not Exist")
        }
    })
}

const registerUser = async function (){
    console.log("Inside Register User")
    kyc.methods.isBank(curraccount).call().then(function(obj){
        console.log(obj)
        if(obj==true){
            var _aadhar_no = $('#aadharNo').val();
            _aadhar_no = "" + _aadhar_no;
            console.log(_aadhar_no)
            kyc.methods.isalreadyRegisteredUser(_aadhar_no).call().then(function(obj){
                if(obj == false){        
                    var _email = $('#user_email').val();
                    var _first_name = $('#first_name').val();
                    console.log(_first_name)
                    var _last_name = $('#last_name').val()
                    console.log(_last_name);
                    var accounts =  window.web3.eth.accounts.create();
                    var _id = accounts.address;
                    //var _aadhar_no = $('#aadharNo').val();
                    var _mobile_no = $('#user_mobile').val();
                    var data = new Date($('#dob').val());
                    var day = data.getDate();
                    var month = data.getMonth() + 1;
                    var year = data.getFullYear();
                    var _dob = day+"-"+month+"-"+year;
                    //var _bank_private_key = $('privateKey').val();
                    var _private_key = accounts.privateKey;
                    var _message = _first_name+_last_name+_aadhar_no+_mobile_no+_email+_dob;
                    console.log(_message);
                    var _hash = web3.utils.soliditySha3(_message);
                    console.log(_hash);
                    //const _sign = await web3.eth.personal.sign(_hash,curraccount)
                    web3.eth.personal.sign(_hash,curraccount).then(function(_sign){
                        console.log(_sign);
                        var obj = {"private_key" : _private_key,"email":_email,"address":_id};
                        var t = JSON.stringify(obj);
                        
                        kyc.methods.registerUser(_first_name,_last_name,_dob,_aadhar_no,_email,_mobile_no,_sign,_hash,_id).send({
                            from : curraccount,
                            gas : 500000
                        }).then(async function(){
                            try{
                                console.log("Fine");
                                var done=await web3.eth.sendTransaction({from: curraccount ,to:_id, value:web3.utils.toWei("2", "ether")});
                                }
                                catch(err)
                                {
                                    console.log(err);
                                }
                            sendDataServer(t);
                        });
                    })
                }else{
                    alert("User Is already Registered On KYC Chain")
                }
            })
        }else{
            alert("Only Bank Can Register a User")
        }
    })
    
}

async function listenToEvents(){
    await $.get('KYC', function(kycArtifact){
        var abi = kycArtifact['abi'];
        kyc = new  window.web3.eth.Contract(abi,contractAddress)
        },"json")
    //watching for isAdminEvent
    console.log(kyc)
    kyc.events.allEvents(function(error,event){
                  if(!error)
                   {       console.log("in events")
                       //Admin not recognized
                     // if(event.args.status == false)
                        console.log(event);

                      //   if(event.args.status == true)
                       //  console.log("status:"+event.args.status+" msg:"+event.args.msg);
                    
                    }
                     else{
                         console.log("Fatal error has occured in isAdminEvent");
                     }

             }).on('data',function(event){console.log(event)})
             .on('changed',function(event){}).on('error',console.error);

}
       
function verifyBank(usr_address){
    console.log(usr_address);
    kyc.methods.gethash(usr_address).call().then(
        function(obj){
            console.log(obj[0]);//last updated bank address
            console.log(obj[1]);//sign
            console.log(obj[2]);//hash
            console.log("debug")
            web3.eth.personal.ecRecover(obj[2],obj[1]).then(
              
                function(signing_address){
                    
                    if(signing_address.toUpperCase() === obj[0].toUpperCase()){
                        console.log('hello');
                        kyc.methods.getBank(obj[0]).call().then(function(bank){
                            
                            document.getElementById("_status").innerHTML = "Verified By "+bank[0];
                        })
                    }             
                    else
                        alert("Not Verified");
                        
                }
            )
        }
    );
}

function updateUserKYCDetails(){
    var _userAddress = $('#accountAddress').val();
    console.log(_userAddress);
    kyc.methods.isBank(curraccount).call().then(function(obj){
        console.log(obj)
        if(obj==true){
            var _email = $('#_user_email').val();
            var _first_name = $('#_first_name').val();
            console.log(_first_name)
            var _last_name = $('#_last_name').val()
            console.log(_last_name);
            var _aadhar_no = $('#_aadharNo').val();
            var _mobile_no = $('#_user_mobile').val();
            var data = new Date($('#_dob').val());
            var day = data.getDate();
            var month = data.getMonth() + 1;
            var year = data.getFullYear();
            var _dob = day+"-"+month+"-"+year;
            var _message = _first_name+_last_name+_aadhar_no+_mobile_no+_email+_dob;
            console.log(_message);
            var _hash = web3.utils.soliditySha3(_message);
            console.log(_hash);
            //const _sign = await web3.eth.personal.sign(_hash,curraccount)
            web3.eth.personal.sign(_hash,curraccount).then(function(_sign){
                console.log(_sign);
                var obj = {"email":_email,"address":_userAddress};
                var t = JSON.stringify(obj);
                kyc.methods.updateKYC(_first_name,_last_name,_dob,_aadhar_no,_email,_mobile_no,_sign,_hash,_userAddress).send({
                    from : curraccount,
                    gas : 500000
                }).then(function(){
                    sendDataServer(t);
                });
            })
        }else{
            alert("Only Bank Can Update User Details")
        }
    })
}

function updateKYC()
{
    console.log("Inside Update KYC")
    var _userAddress = $('#accountAddress').val();
    console.log(_userAddress);
    checkKYCvalidity(_userAddress).then(function(flag){
        if(flag==true)
    
        {
    kyc.methods.isValidBank(curraccount,_userAddress).call().then(function(obj){
        if(obj == true){
            kyc.methods.getUserforBank(_userAddress).call().then(function(user){
                console.log(user);
                document.getElementById("_first_name").value = user[0];
                document.getElementById("_last_name").value = user[1];
                document.getElementById("_dob").value = user[2];
                document.getElementById("_aadharNo").value = user[3];
                document.getElementById("_user_email").value = user[4];
                document.getElementById("_user_mobile").value = user[5];
                document.getElementById("updateUserDetails").hidden = false;
            }).then(function(){
                var _userAddress = $('#accountAddress').val();
                verifyBank(_userAddress);       
            })
        }else{
            alert("Bank Does Not Have Access To KYC Details Of This User");
        }
    })
}
else{
    alert("KYC has expired!");
}}
    )
}
function getUserDetailsForUser(){
    checkKYCvalidity(curraccount).then(function(flag){
        if(flag==true)
        {
    kyc.methods.getUserforUser(curraccount).call().then(function(user){
                    console.log(curraccount);
                    console.log(user);
                    document.getElementById("first_name").value = user[0];
                    document.getElementById("last_name").value = user[1];
                    document.getElementById("dob").value = user[2];
                    document.getElementById("aadharNo").value = user[3];
                    document.getElementById("user_email").value = user[4];
                    document.getElementById("user_mobile").value = user[5];
                    document.getElementById("userDetails").hidden = false;
                })
            }
            else{
                alert("KYC expired!")
            }})
    // kyc.methods.isValidUser(curraccount).call().then(function(obj){
    //     if(obj==true){
    //         kyc.methods.getUserforUser(curraccount).call().then(function(user){
    //             console.log(curraccount);
    //             console.log(user);
    //             document.getElementById("first_name").value = user[0];
    //             document.getElementById("last_name").value = user[1];
    //             document.getElementById("dob").value = user[2];
    //             document.getElementById("aadharNo").value = user[3];
    //             document.getElementById("user_email").value = user[4];
    //             document.getElementById("user_mobile").value = user[5];
    //             document.getElementById("userDetails").hidden = false;
    //         })
    //     }else{
    //         alert("User Is Not Valid")
    //     }
    // })
}

 function getUserDetailsForBank(){
    var _userAddress = $('#accountAddress').val();
    if(_userAddress === ""){
        alert("User Address Required")
    }else{
        kyc.methods.isValidBank(curraccount,_userAddress).call().then( function(obj){
            if(obj == true){
                console.log(obj);
                checkKYCvalidity(_userAddress).then(function(flag){
                    if(flag==true)
                
                    {kyc.methods.getUserforBank(_userAddress).call().then(function(user){
                        console.log(user);
                        var UserDetailsForBank = $('#UserDetailsForBank');
                        UserDetailsForBank.find('.first_name').text(user[0]);
                        UserDetailsForBank.find('.last_name').text(user[1]);
                        UserDetailsForBank.find('.Aadhar_no').text(user[3]);
                        UserDetailsForBank.find('.dob').text(user[2]);
                        UserDetailsForBank.find('.mobile_no').text(user[5]);
                        UserDetailsForBank.find('.email_address').text(user[4]);
                        UserDetailsForBank.find('.userAccountAddress').text(_userAddress);
                        $('#articlesRow').append(UserDetailsForBank.html());
    
                    })
                }
                else{
                    alert("KYC has expired for the user");
    
                }


                })
               
            }else{
                alert("Bank Does Not Have Access To KYC Details Of This User");
            }
        })
    }
}

function displayAccountInfo (web3js) {
    //  acc = web3.eth.getAccounts();
    //  web3.eth.defaultAccount = acc[0];

        web3js.eth.getCoinbase(function(err,account){
            if(err === null){
                curraccount = account;
                $('#account').text(account);
                web3js.eth.getBalance(account,function(err,balance){
                    if(err === null){
                        console.log(web3.utils.fromWei(balance,"ether"));
                        $('#accountBalance').text(web3.utils.fromWei(balance,"ether") + " ETH");
                    }
                })
            }
        });
}

function registerBank(){
    console.log("In register bank")
   
    kyc.methods.getAdminID().call().then(function(adminid){
        console.log(adminid);
        console.log(typeof adminid)
        console.log(curraccount);
        console.log(typeof curraccount);
        if(adminid.toUpperCase() === curraccount.toUpperCase()){
            console.log(curraccount)
            console.log(kyc);
            var accounts =  window.web3.eth.accounts.create();
            var _id = accounts.address; // put account address here
            var _bank_email = $('#bank_email').val();
            var _bank_id = $('#bank_id').val();
            var _bank_name = $('#bank_name').val();
            kyc.methods.alreadyExistingBank(_bank_name).call().then(function(obj){
                if(obj == true){
                    alert(_bank_name + " has already registered in KYC Chain");
                }else{
                    var _private_key = accounts.privateKey;
                    var obj = {"private_key" : _private_key,"email":_bank_email,"address":_id};
                    var t = JSON.stringify(obj);
                    kyc.methods.registerBank(_bank_name,_id,_bank_email).send({
                        from : curraccount,
                        gas : 500000
                    }).then(function()
                    {
                    console.log(_id)
                        return kyc.methods.getBank(_id).call();
                    }).then(async function(bank){
                        console.log(bank[0]);
                        console.log(bank[1]);
                        console.log(bank[2]);
                        //console.log(bank[3]);
                        try{
                        var done=await web3.eth.sendTransaction({from: adminid ,to:bank[1], value:web3.utils.toWei("10", "ether")});
                        }
                        catch(err)
                        {
                            console.log(err);
                        }
                        sendDataServer(t);
                    });
                }
            })
        }else{
            alert("only Admin can Register A Bank");
        }
    })
}

function sendDataServer(t){
       console.log("Inside ProcessData")
       console.log(t)
       var xhr = new XMLHttpRequest();
       xhr.open('POST','/postjson',true);
       xhr.setRequestHeader('Content-type','application/json');
       xhr.onload = function(){
            console.log(this.responseText);
        }
        xhr.send(t);
}

function checkKYCvalidity(_userAddress){
   
        var promise = new Promise(function(resolve, reject) {
            var ts = Date.now();
            kyc.methods.getLastModified(_userAddress).call().then(function(obj){
                var lm=obj;
                console.log(lm)
                console.log(ts)
                console.log(ts-lm)
                result=false
        
                if(ts-lm > 100000)
                {
                    result=false;
                }
                else{
                result=true; 
                }
            resolve(result);
          });    
})
return promise;

}



window.addEventListener('load', async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            console.log('hey');
            // Request account access if needed
            await window.ethereum.enable();
            displayAccountInfo(window.web3);
            
            $.get('KYC', function(kycArtifact){
                var abi = kycArtifact['abi'];
                kyc = new  window.web3.eth.Contract(abi,contractAddress)
                },"json")
                
        }
        catch (error) {
            console.log(error);
            // User denied account access...
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
        // Acccounts always exposed
        //web3.eth.sendTransaction({/* ... */});
    }
    // Non-dapp browsers...
    else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
    //console.log("error");
    
    listenToEvents();
});

// $(function() {
//      $(window).load(function() {
       
//     //   //  var Web3 = require('web3');
//     //     //var web3 = new Web3(window.web3.currentProvider);
//     //     //var web3 = new web3.providers.HttpProvider('http://127.0.0.1:7545');
//     //     //web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"))
//     //     var web3js = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
//     //     if (typeof web3 !== 'undefined') {
//     //         // Use MetaMask's provider
//     //         web3 = new Web3(web3.currentProvider)
//     //         console.log('hell');
//     //       } else {
//     //         web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"))
//     //       }
//     //       web3js.eth.getAccounts().then(function(a){console.log(a[0])})
//     //     //console.log("go to hell")
//     //     const address = '0x59f7aee1EE46Bcc62c79436e68bE8B31b1Cb46f9';
//     //     displayAccountInfo(web3js);
//     //     $.getJSON('KYC.json',function(kycArtifact){
//     //         var abi = kycArtifact['abi'];
//     //         var kyc = new web3.eth.Contract(abi,address);
//     //         console.log(kyc)
//     //       //  var kyc = contract.at(address);
//     //         kyc.methods.getAdminID().call().then(function(adminid)
//     //         {
//     //             console.log(adminid)
//     //             //var accounts=web3.eth.accounts.create();
//     //             var accounts;
//     //           //  registerBank(kyc,accounts.address);
//     //           registerBank(kyc,0x7fbFf5D4496fD3539C9a73Ea54280982cA13E9E3);
//     //            //console.log(accounts);
//     //         });
            
        
//     //       //App.init();/*Gets Called When page Gets Loaded*/
//     //  });


   // Modern dapp browsers...
//     if (window.ethereum) {
//         window.web3 = new Web3(ethereum);
//         try {
//             ethereum.enable();
//             var accounts= await web3.eth.getAccounts();
//             var option={from: accounts[0] };
//             var myContract = new web3.eth.Contract(abi,contractAddress);
//             myContract.methods.RegisterInstructor('11','Ali')
//             .send(option,function(error,result){
//                 if (! error)
//                     console.log(result);
//                 else
//                     console.log(error);
//             });
//         } catch (error) {
//             // User denied account access...
//         }
//     }
//     //Legacy dapp browsers...
//     else if (window.web3) {
//         window.web3 = new Web3(web3.currentProvider);
//         // Acccounts always exposed
//         web3.eth.sendTransaction({/* ... */});
//     }
//     // Non-dapp browsers...
//     else {
//         console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');




// // });
// // })

