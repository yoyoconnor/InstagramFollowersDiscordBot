//define variable
const { response } = require('express');
let peopleList = require('../src/number.json');
let poolsize=peopleList.length;
console.log(poolsize);
let initialGroupSize=11;
let groupSizes=[];
let csvCollector=[];
//create an array of people and then thier set
let arrayOfUserSets=[];
for(let i=0;i<poolsize;i++){
    let userSet=new Set();
    userSet.add(peopleList[i]);

    arrayOfUserSets.push({user:peopleList[i],set:userSet});
}
//log last 20 user sets
let userResponses=[];
for(let i=0;i<poolsize;i++){
    
    userResponses.push({user:peopleList[i],responses:[]});
    
}
console.log('responses');
console.log(userResponses.find(element=>element.user===500).responses);

function findNextGroupSize(){
    if(groupSizes.length==0){
        groupSizes.push(initialGroupSize);
        return initialGroupSize;
    }
    let nextGroupSize=0;
    //go through the groupSizes array and find the next group size
    let expectedValuepPerGroupMember=0;
    for(let i=0;i<groupSizes.length;i++){
        expectedValuepPerGroupMember+=((groupSizes[i]-1)/(poolsize-1))
}
let groupsize=(initialGroupSize/(1-expectedValuepPerGroupMember));
groupSizes.push(Math.round(groupsize));
return Math.round(groupsize);
}



//creates groups of size size adn size-1
const createGroups = (size) => {
    let allgroups=[];
let tempList=peopleList.slice().sort(()=>Math.random()-0.5);
console.log('peopleList');
console.log(peopleList);
let numberOfGroups=Math.round(poolsize/size+0.5)
let numberOffullGroups=numberOfGroups+(poolsize-(size*numberOfGroups))
for(let i=0;i<numberOffullGroups;i++){
    let group=[];
    for(let j=0;j<size;j++){
        group.push(tempList.pop());
    }
    allgroups.push(group);
}
//partial groups
for(let i=0;i<numberOfGroups-numberOffullGroups;i++){
    let group=[];
    for(let j=0;j<size-1;j++){
        group.push(tempList.pop());
    }
    allgroups.push(group);
}
return allgroups;
}

//creat csv of sets
//generate groups
const createCSV = () => {
    console.log(csvCollector)
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "user,responses\n";
    csvCollector.forEach(function(rowArray) {
        let row = rowArray.user + ',' + rowArray.responses.join(",");
        csvContent += row + "\r\n";
    });
    console.log(csvContent);
}
let massiveArr=[]
for(let i=0;i<6;i++){
let groups=createGroups(findNextGroupSize())
//go through group members and assign responses and then add to set
for(let i=0;i<groups.length;i++){
    for(let j=0;j<groups[i].length;j++){
        let mainUserSet=arrayOfUserSets.find(element=> element.user ===groups[i][j]).set;
        //clear user response array
        userResponse=[];

        for(let k=0;k<groups[i].length;k++){
                if(!mainUserSet.has(groups[i][k])){
                    userResponse.push(groups[i][k]);
                }
                mainUserSet.add(groups[i][k]);
        }
        
        const index = userResponses.findIndex(element => element.user === groups[i][j]);
        userResponses[index].responses=userResponse;
        if(csvCollector.find(element=>element.user===groups[i][j])===undefined){
            csvCollector.push({user:groups[i][j],responses:[]});
        }
        var collection = csvCollector.find(element=>element.user===groups[i][j]).responses;
        for (let k=0;k<userResponse.length;k++){
            collection.push(userResponse[k]);
        }

    }
    }
    
massiveArr.push(groups);
//assign itterations to indivual output 
}

createCSV();