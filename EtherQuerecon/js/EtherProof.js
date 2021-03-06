if (typeof web3 !== 'undefined') {
	web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    //web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
	web3 = new Web3(new Web3.providers.HttpProvider("http://172.18.64.91:8545"));
}

var reader = new FileReader();
var file;
var toBeHashed = '';
var EtherProofAPI = [{"constant":true,"inputs":[{"name":"hash","type":"bytes32"}],"name":"getBlockNumber","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"hash","type":"bytes32"}],"name":"addFile","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"hash","type":"bytes32"}],"name":"getTimestamp","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"hash","type":"bytes32"}],"name":"checkExistence","outputs":[{"name":"","type":"bool"}],"type":"function"}];
// Need to get a permanent address once deployed on main net
//var address = '0xd49bc1cc5a80835b0a70875f9594204d6dd5a0dc';

var address = '0xd955f70cb082ed22f1829409cfb91ec567eb9e63';

/* Copy paste the following code into geth to deploy the contract.
Once the contract is deployed (either on main net or your private test net), 
copy paste its address into the line above replacing the current address
Web3 deploy:
var etherproofContract = web3.eth.contract([{"constant":true,"inputs":[{"name":"hash","type":"bytes32"}],"name":"getBlockNumber","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"hash","type":"bytes32"}],"name":"addFile","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"hash","type":"bytes32"}],"name":"getTimestamp","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"hash","type":"bytes32"}],"name":"checkExistence","outputs":[{"name":"","type":"bool"}],"type":"function"}]);
var etherproof = etherproofContract.new(
   {
     from: web3.eth.accounts[0], 
     data: '606060405261023a806100126000396000f360606040526000357c010000000000000000000000000000000000000000000000000000000090048063473781451461005a5780636b31827014610086578063d45c44351461009e578063eef66dac146100ca57610058565b005b61007060048080359060200190919050506100f8565b6040518082815260200191505060405180910390f35b61009c600480803590602001909190505061012a565b005b6100b460048080359060200190919050506101a2565b6040518082815260200191505060405180910390f35b6100e060048080359060200190919050506101d4565b60405180821515815260200191505060405180910390f35b60006000600050600083600019168152602001908152602001600020600050600101600050549050610125565b919050565b610133816101d4565b80156101415750620186a034105b1561014b57610002565b60406040519081016040528042815260200143815260200150600060005060008360001916815260200190815260200160002060005060008201518160000160005055602082015181600101600050559050505b50565b600060006000506000836000191681526020019081526020016000206000506000016000505490506101cf565b919050565b600060006000600050600084600019168152602001908152602001600020600050600001600050541415801561022e5750600060006000506000846000191681526020019081526020016000206000506001016000505414155b9050610235565b91905056', 
     gas: 4700000
   }, function (e, contract){
    console.log(e, contract);
    if (typeof contract.address !== 'undefined') {
         console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
    }
 })
*/
var EtherProof = web3.eth.contract(EtherProofAPI).at(address);

$(function () {
    var dropZoneId = "drop-zone";
    var buttonId = "clickHere";
    var mouseOverClass = "mouse-over";

    var dropZone = $("#" + dropZoneId);
    var ooleft = dropZone.offset().left;
    var ooright = dropZone.outerWidth() + ooleft;
    var ootop = dropZone.offset().top;
    var oobottom = dropZone.outerHeight() + ootop;
    var inputFile = dropZone.find("input");
    document.getElementById(dropZoneId).addEventListener("dragover", function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.addClass(mouseOverClass);
        var x = e.pageX;
        var y = e.pageY;

        if (!(x < ooleft || x > ooright || y < ootop || y > oobottom)) {
            inputFile.offset({ top: y - 15, left: x - 100 });
        } else {
            inputFile.offset({ top: -400, left: -400 });
        }

    }, true);

    if (buttonId != "") {
        var clickZone = $("#" + buttonId);

        var oleft = clickZone.offset().left;
        var oright = clickZone.outerWidth() + oleft;
        var otop = clickZone.offset().top;
        var obottom = clickZone.outerHeight() + otop;

        $("#" + buttonId).mousemove(function (e) {
            var x = e.pageX;
            var y = e.pageY;
            if (!(x < oleft || x > oright || y < otop || y > obottom)) {
                inputFile.offset({ top: y - 15, left: x - 160 });
            } else {
                inputFile.offset({ top: -400, left: -400 });
            }
        });
    }

    document.getElementById(dropZoneId).addEventListener("drop", function (e) {
        $("#" + dropZoneId).removeClass(mouseOverClass);
    }, true);

})

document.getElementById('file').addEventListener('change', load, true);

document.getElementById('file').onchange = function() {
	var name = this.value;
	name = name.split("\\");
	name = name[name.length - 1];
	document.getElementById('chosenFile').textContent = name;
	document.getElementById('hash').textContent = '';
	document.getElementById('existence').textContent = '';
	document.getElementById('register').style.display = 'none';
	loop();
}

function load() {
	file = document.getElementById('file').files[0];
	reader.onloadend = function(evt) {
		if (evt.target.readyState == FileReader.DONE) {
			var result = evt.target.result;
			toBeHashed = result;
		}
		document.getElementById('hash').textContent = 'Keccak-256 hash of file: ' + web3.sha3(toBeHashed);
		existence();
	}
}

function loop() {
	if (!file) {
		alert('Please select a file!');
		return;
	}
	reader.readAsBinaryString(file);
}

function existence() {
        var hash = document.getElementById('hash').textContent.slice(-66);
        var existence = document.getElementById('existence');
        var fileExistence = EtherProof.checkExistence(hash, function(error, result) {
                if (error) {
                        console.error(error);
                }
        });
        if (hash.length != 66) {
                existence.innerHTML = '<h2> Pick a file and generate a hash first </h2>';
                document.getElementById('register').style.display = 'none';
        } else if (!fileExistence) {
                existence.innerHTML = '<h2> This File Does Not Exist </h2>';
                existence.innerHTML += 'Register Your File Now for 100 000 wei';
                existence.innerHTML += '<br>';
                document.getElementById('register').style.display = 'block';
        } else {
                document.getElementById('register').style.display = 'none';
                existence.innerHTML = '<h2> This File Exists </h2>';
                var timestamp = EtherProof.getTimestamp(hash, function(error, result) {
                        if (error) {
                                console.error(error);
                        }
                }); 
                var blockNumber = EtherProof.getBlockNumber(hash, function(error, result) {
                        if (error) {
                                console.error(error);
                        }
                });
                existence.innerHTML += '<p> Timestamp: ' + new Date(timestamp * 1000) + '</p>' +
                        '<p> Block Number: ' + blockNumber + '</p>';
        }
}

function register(form) {
	document.getElementById('existence').innerHTML = '';
	document.getElementById('register').style.display = 'none';
        EtherProof.addFile.sendTransaction(
                web3.sha3(toBeHashed),
                {
                        from: web3.eth.accounts[$('#accounts').val()],
                        value: 100000,
                        gas: 4700000
                }, function (error, result) {
                        if (error) {
                                console.log(error);
                        }
                        var txhash = result;
                        var filter = web3.eth.filter('latest');
                        filter.watch(function (error, result) {
                                if (error) {
                                        console.log(error);
                                }
                                var receipt = web3.eth.getTransactionReceipt(txhash);
                                if (receipt && receipt.transactionHash == txhash) {
                                        alert("Your transaction has been mined!");
					if (localStorage.getItem('recentHashes')) {
						
					}
                                        var r = JSON.parse(localStorage.getItem('recentHashes'));
					var length = r.length;
					if (length < 5) {
						r[length] = web3.sha3(toBeHashed);
					} else {
						r[5] = web3.sha3(toBeHashed);
						for (var i = 0; i < 5; ++i) {
							r[i] = r[i + 1];
						}
					}
					localStorage.setItem('recentHashes', JSON.stringify(r));
					updateTable();
					filter.stopWatching();
                                }
                        });
                }
        );
}

function updateTable() {
        var hashTable = document.getElementById('recentHashes');
        var numRows = hashTable.rows.length;
        for (var i = 1; i < numRows; ++i) {
                hashTable.deleteRow(1);
        }
        var length = JSON.parse(localStorage.getItem('recentHashes')).length;
        if (length > 5) {
                length = 5;
        }
        for (var j = 0; j < length; ++j) {
                var row = hashTable.insertRow(1);
                var newHash = row.insertCell(0);
                var newTimestamp = row.insertCell(1);
                var newBlockNumber = row.insertCell(2);
                newHash.innerHTML = JSON.parse(localStorage.getItem('recentHashes'))[j];
                var timestamp = EtherProof.getTimestamp(newHash.innerHTML, function(error, result) {
                        if (error) {
                                console.error(error);
                        }
                });
                var blockNumber = EtherProof.getBlockNumber(newHash.innerHTML, function(error, result) {
                        if (error) {
                                console.error(error);
                        }
                });
                newTimestamp.innerHTML = new Date(timestamp * 1000);
                newBlockNumber.innerHTML = blockNumber;
        }
}

function search(form) {
        var hash = form.searchHash.value;
        var searchResult = document.getElementById('searchResult');
        if (!EtherProof.checkExistence(hash)) {
                searchResult.innerHTML = '<h2> This File Does Not Exist </h2>';
        } else {
                searchResult.innerHTML = '<h2> This File Exists </h2>';
                var timestamp = EtherProof.getTimestamp(hash, function(error, result) {
                        if (error) {
                                console.error(error);
                        }
                });
                var blockNumber = EtherProof.getBlockNumber(hash, function(error, result) {
                        if (error) {
                                console.error(error); 
                        }
                });
                searchResult.innerHTML += '<p> Timestamp: ' + new Date(timestamp * 1000) + '</p>' +
                        '<p> Block Number: ' + blockNumber + '</p>';
        }
}

$(document).ready(function() {
        for (var i = 0; i < web3.eth.accounts.length; ++i) {
                $('#accounts').append("<option value=\"" + i + "\">" + web3.eth.accounts[i] + "</option>");
        }
	updateTable();
});
