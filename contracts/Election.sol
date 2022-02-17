pragma solidity >=0.4.22;

contract Election {
  constructor() public {
    addCandidate("Candidate 1");
    addCandidate("Candidate 2");
  }

  // our candidate model
  struct Candidate {
    uint id;
    string name;
    uint voteCount;
  }

  // accounts who have voted
  mapping(address => bool) public voters;
  // key/value pairs of candidates
  mapping(uint => Candidate) public candidates;

  // store the candidate count in a variable
  uint public candidatesCount;

  function addCandidate (string memory _name) private {
    candidatesCount ++;
    candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
  }

  function vote (uint _candidateId) public {
    // make sure this user hasn't voted
    require(!voters[msg.sender]);

    // ensure the candidate is valid
    require(_candidateId > 0 && _candidateId <= candidatesCount);
    
    // record that voter has voted
    voters[msg.sender] = true;
    
    // update candidate vote count
    candidates[_candidateId].voteCount ++;
  }
  
}