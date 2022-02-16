App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    console.log('App Initialized.');
    return App.initWeb3();
  },

  initWeb3: async function() {
    if (window.ethereum) {
      console.log('Metamask is installed.')
      // request account access
      await window.ethereum.request({method: 'eth_requestAccounts'});
      // If a web3 instance is already provided by Meta Mask.
      // App.web3Provider = window.ethereum;
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    } else {
      console.log('Metamask is NOT installed.')
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    window.web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      App.contracts.Election.deployed().then(function(instance) {
        console.log('Election Contract Address: ', instance.address);
        App.render();
      });
    });
  },

  loadContractData: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    App.contracts.Election.deployed().then(function(instance) {
      console.log('instance is ', instance)
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      console.log('candidatesCount is ', candidatesCount)
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function(candidate) {
          console.log('candidate is ', candidate)
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);
        });
      }

      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  render: function() {
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        console.log("Account: ", App.account);
        $("#accountAddress").html("Your Account: " + account);
      }
      App.loadContractData()
    })
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

window.ethereum.on('accountsChanged', (accounts) => {
  App.render();
});