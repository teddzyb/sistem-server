const express = require("express");
const { getPetitions, getPetitionById, createPetition, joinPetition, coordinatorApprovePetition, chairApprovePetition, leavePetition, getStudentJoinedPetitions, joinWaitingList, leaveWaitingList, confirmParticipation, setPetitionDeadline, getWaitlists, getPetitionsBySemester, addRemarks, getCurrentPetitions, deletePetition } = require("../controllers/petitionController");
const router = express.Router();

router.get("/", getPetitions)

router.post("/", createPetition)

router.patch("/join/:id", joinPetition)

router.patch("/leave/:id", leavePetition)

router.patch("/coordinator-approve/:id", coordinatorApprovePetition);

router.patch("/chair-approve/:id", chairApprovePetition);

router.get("/student/:id", getStudentJoinedPetitions)

router.patch('/join-waiting-list/:id', joinWaitingList)

router.patch('/leave-waiting-list/:id', leaveWaitingList)

router.patch('/confirm-join/:id', confirmParticipation)

router.patch('/deadline/:id', setPetitionDeadline)

router.get('/waiting-list/:id', getWaitlists)

router.get('/semester/:year/:semester', getPetitionsBySemester)

router.patch('/add-remarks/:id', addRemarks)

router.get("/:id", getPetitionById);

router.delete('/:id', deletePetition);


module.exports = router;