const Election = artifacts.require("./Election.sol");

contract("Election", function(accounts) {
  var electionInstance

  it("initializes with two candidates", function() {
    return Election.deployed().then(function(instance) {
      return instance.candidatesCount();
    }).then(function(count) {
      assert.equal(count, 2);
    })
  })

  it("initializes the candidates with the correct values", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidates(1);
    }).then(function(candidate) {
      assert.equal(candidate[0], 1, "contains the correct id");
      assert.equal(candidate[1], "Candidate 1", "contains the correct name");
      assert.equal(candidate[2], 0, "contains the correct vote count");
      return electionInstance.candidates(2);
    }).then(function(candidate) {
      assert.equal(candidate[0], 2, "contains the correct id");
      assert.equal(candidate[1], "Candidate 2", "contains the correct name");
      assert.equal(candidate[2], 0, "contains the correct vote count");
    })
  })

  it("allows a voter to cast a vote", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidateId = 1;
      return electionInstance.vote(candidateId, { from: accounts[0] });
    }).then(function() {
      return electionInstance.voters(accounts[0]);
    }).then(function(voted) {
      assert(voted, "the voter was logged in");return electionInstance.candidates(candidateId);
    }).then(function(candidate) {
      const voteCount = candidate[2];
      assert(voteCount, 1, "increments the candidates vote count")
    })
  })

  it("throws an exception for invalid candidates", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.vote(99, { from: accounts[1] });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return electionInstance.candidates(1);
    }).then(function(candidate1) {
      const voteCount = candidate1[2];
      assert(voteCount, 1, "candidate 1 did not recieve any votes");
      return electionInstance.candidates(2);
    }).then(function(candidate2) {
      const voteCount = candidate2[2];
      assert(voteCount, 1, "candidate 1 did not recieve any votes");
    });
  });

  it("throws an exception for double voting", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidateId = 2;
      return electionInstance.vote(candidateId, { from: accounts[2] });
    }).then(function() {
      return electionInstance.candidates(candidateId);
    }).then(function(candidate) {
      const voteCount = candidate[2];
      assert.equal(voteCount, 1, "accepts first vote");
      // Try to vote again
      return electionInstance.vote(candidateId, { from: accounts[2] });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return electionInstance.candidates(1);
    }).then(function(candidate1) {
      const voteCount = candidate1[2];
      assert(voteCount, 1, "candidate 1 did not recieve any votes");
      return electionInstance.candidates(2);
    }).then(function(candidate2) {
      const voteCount = candidate2[2];
      assert(voteCount, 1, "candidate 1 did not recieve any votes");
    });
  });

});