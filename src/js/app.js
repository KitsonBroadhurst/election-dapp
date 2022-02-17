App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  blockNumber: 'latest',

  init: function() {
    console.log('App Initialized.');
    return App.initWeb3();
  },

  initWeb3: async function() {
    if (window.ethereum) {
      console.log('Metamask is installed.')
      // request account access
      await window.ethereum.request({method: 'eth_requestAccounts'});
      // set our user account
      window.ethereum.enable().then(function(accounts) {
        App.account = accounts[0];
        console.log("Account: ", App.account);
        $("#accountAddress").html("Your Account: " + accounts[0]);
      });
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
      // listen for contract events
      App.listenForEvents();

      App.contracts.Election.deployed().then(function(instance) {
        console.log('Election Contract Address: ', instance.address);
        App.render();
      });
    });
  },

  castVote: function() {
    console.log('castVote was triggered...')
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      console.log('result is ', result)
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },

  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      instance.votedEvent({}, {
        fromBlock: App.blockNumber,
        toBlock: 'latest'
      }).watch(function(_, event) {
        console.log('event triggered: ', event);
        // update the Block number
        App.blockNumber = event.blockNumber + 1;
        // Reload when a new vote is received
        App.render();
      })
    })
  },

  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesSelect = $("#candidatesSelect");
      candidatesSelect.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);

          // Render candidate ballot option
          var candidateOption ="<option value='" + id + "' >" + name + "</option>"
          candidatesSelect.append(candidateOption);
        });
      }
      return electionInstance.voters(App.account);
    }).then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

window.ethereum.on('accountsChanged', (account) => {
  App.render();
});