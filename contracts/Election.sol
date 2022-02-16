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

  // key/value pairs for candidates
  mapping(uint => Candidate) public candidates;

  // store the candidate count in a variable
  uint public candidatesCount;

  function addCandidate (string memory _name) private {
    candidatesCount ++;
    candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
  }

  
}