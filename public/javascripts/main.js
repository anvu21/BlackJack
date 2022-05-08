var deck_id;
let first_time = true;
//////////

//Adjustable Game Variables
let playbtn1

let dealerDrawTo = 17 //The number at which the dealer stays
//Initialize variables !!DON'T CHANGE ANY VARIABLES BELOW THIS LINE!!
let cardStack = [] //This is our deck
let playerHand = [] //Player Hand
let dealerHand = [] //dealer Hand
let pHandAces = 0 
let dHandAces = 0 
let pHandVal = [] 
let dHandVal = [] 

let playerSum = 0 //total player card for the counter display
let dealerSum = 0 
let dealerSumShow = 0 //total for the dealer when he has not reveal his hand
let isDealerTurn = false //flag that I loop until dealer draws 17 or more.
let roundOver = true 
let cardID = 0 //this shows the random card we will draw from cardStack
let message = "" 
//DOM Object Variable Initialization
let dealerCardsEl = document.getElementById("dealer-cards-el") //Stores the DOM object 
let myModal=document.getElementById("myModal");
let playerCardsEl = document.getElementById("player-cards-el")

let playBn1 = document.getElementById("playbtn1") 
let dealerSumEl = document.getElementById("dealer-sum-el") 
let messageEl = document.getElementById("message-el") 
let hitBtn = document.getElementById("hitbtn") 
let standBtn = document.getElementById("standbtn") 


// Stats variable initialization

//just set the message first as play
playBn1.textContent = "Play"

//What happend when you press play
async function playButton() {
    myModal.style.display = "none";

    if (first_time) {
        await getData();
        first_time = false;
    }

        startGame()

}


//get cards through api
async function getData() {
    // Default options are marked with *
    const response = await fetch("http://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
    const deckDetail = await response.json();// parses JSON response into js obj
    deck_id = deckDetail.deck_id;

    
}
//pull card and push that to player hand
async function get_card_player() {
    //get the card first
    const card_url = "http://deckofcardsapi.com/api/deck/" + deck_id + "/draw/?count=1";
    const response = await fetch(card_url);
    const deckDetail = await response.json();// parses JSON response into native JavaScript objects
    const card_data = deckDetail.cards[0];

    playerHand.push(card_data);

    if(parseInt(deckDetail.remaining)==0){
        await getData();

    }

 
}

//pull card and push that to player hand
async function get_card_dealer() {

    const card_url = "http://deckofcardsapi.com/api/deck/" + deck_id + "/draw/?count=1";
    const response = await fetch(card_url);
    const deckDetail = await response.json();
    const card_data = deckDetail.cards[0];
    dealerHand.push(card_data);
    if(parseInt(deckDetail.remaining)==0){
        await getData();

    }


}

//function to clean hand and deal 2 cards 
async function startGame() {

    if (roundOver === true) {

        isDealerTurn = false //set flag for dealer off
        roundOver = false //game starts

        //Clear out both player hands
        if (playerHand.length > 0) {
            playerHand.splice(0, playerHand.length)
            dealerHand.splice(0, dealerHand.length)
        }

        //Perform initial deal
        for (x = 0; x < 2; x++) { 
            await get_card_player();
            await get_card_dealer();
        }

        renderGame() // Display deal and sums to Player and Dealer
    }
}

//This function renders everything and update as well. 
function renderGame() {
    sumCards() //Get sum to update 
    if (roundOver === true) {
        //change the color of the button
        hitBtn.style.backgroundColor = 'rgb(212, 212, 212)'
        standBtn.style.backgroundColor = 'rgb(212, 212, 212)'
        playBn1.style.backgroundColor = 'rgb(206, 121, 31)'

 
        
    } else { 
        standBtn.style.backgroundColor = 'rgb(206, 121, 31)'
        hitBtn.style.backgroundColor = 'rgb(206, 121, 31)'
        playBn1.style.backgroundColor = 'rgb(212, 212, 212)'
 
        
        
        
    }
    
    document.getElementById("message-el").textContent = message //Render messages
    //Render player cards, card images and point
    document.getElementById("player-sum-el").textContent = "Point: " + playerSum
    playerCardsEl.textContent = "Cards: "
    for (i = 0; i < playerHand.length; i++) { //Loop loads and prints out card
        playerCardsEl.textContent += playerHand[i] + " "
        let srcId = "pcard" + i
        document.getElementById(srcId).src = playerHand[i].image;
    }
    let cardBlanks = 11 - playerHand.length
    for (i = 0; i < cardBlanks; i++) { //loop reloads the blank space
        let tempId = playerHand.length + i
        let srcId = "pcard" + tempId
        document.getElementById(srcId).src = "images/blank.png"
    }

    //Render dealer cards and card hands
    if (isDealerTurn === true) {
        dealerSumEl.textContent = "Point: " + dealerSum
    } else {
        if (dealerSumShow === 11) {
            dealerSumEl.textContent = "Point: 1/11"
        } else {
            dealerSumEl.textContent = "Point: " + dealerSumShow
        }
    }
    dealerCardsEl.textContent = "Cards: "
    if (isDealerTurn === true) { //Only render all cards if it's the dealer turn. Otherwise only display first card
        for (i = 0; i < dealerHand.length; i++) {
            dealerCardsEl.textContent += dealerHand[i] + " "
            let srcId = "dcard" + i
            document.getElementById(srcId).src = dealerHand[i].image;
        }
        cardBlanks = 11 - dealerHand.length
        for (i = 0; i < cardBlanks; i++) {
            let tempId = dealerHand.length + i
            let srcId = "dcard" + tempId
            document.getElementById(srcId).src = "images/blank.png" //This hide one of the dealer card
        }
    } else {
        dealerCardsEl.textContent += dealerHand[0] + " "
        document.getElementById("dcard0").src = dealerHand[0].image;
        document.getElementById("dcard1").src = "images/card_back.png"//Hide one of dealer card
        cardBlanks = 6
        for (i = 2; i < cardBlanks; i++) {
            let srcId = "dcard" + i
            document.getElementById(srcId).src = "images/blank.png"
        }
    }

    

    //if it is the dealer then stay card
    if (isDealerTurn === true) {
        stay_card()
    }
}

//Count the sum and if the round is over, check for winner, and check for burst for both sides
function sumCards() {
   
    playerSum = 0 // Resets 
    pHandAces = 0 
    pHandVal.splice(0, pHandVal.length) // we clean out the player hand value array
    //Loop through the player hand and push the value. 0 is for j,q,k and A is count different so we store it seperately
    for (i = 0; i < playerHand.length; i++) { 
        let value = playerHand[i].code;
        value = value.charAt(0);
        if (value === "A") {
             pHandAces++ }
        else if (value ==="0") {
            pHandVal.push(10)

        }
        else {
         pHandVal.push(value) }
    }
    //Loop checks and add all the J Q K to Sum as 10. Else it is probably just the card value
    for (i = 0; i < (pHandVal.length); i++) { //Loop through the hand
        let value = pHandVal[i] //set the current card checking as value
        if (value === "1" || value === "J" || value === "Q" || value === "K") {
            playerSum += 10 //If the first character is a 1 (meaning 10), J, Q, or K add 10 to the player's sum
        } else { 
            playerSum += parseInt(value) 
        }
    }
    if (pHandAces > 0) { //ace logic
        if ((playerSum + 11 + (pHandAces - 1)) > 21) { //Checks to see if one of the aces being 11 would push the total over 21
            playerSum += pHandAces // If it does push it over 21, only add the total number of aces to the total
        } else { //If the ace being 11 doesn't push it over, add 11 plus the number of aces minus 1 
            playerSum += 11 + (pHandAces - 1)
        }
    }

    //Same thing as player but for dealer
    dealerSum = 0 
    dealerSumShow = 0 
    dHandAces = 0 
    dHandVal.splice(0, dHandVal.length) 
   
    for (ai = 0; ai < dealerHand.length; ai++) {
         let value = dealerHand[ai].code.charAt(0);
          if (value === "A") {
               dHandAces++ 
            }
            else if (value ==="0") {
                pHandVal.push(10)
    
            }

          else { dHandVal.push(value) } }
    for (si = 0; si < dHandVal.length; si++) { 
        let value = dHandVal[si] 
        if (value === "1" || value === "J" || value === "Q" || value === "K") {
            dealerSum += 10 
        } else { 
            dealerSum += parseInt(value)
        }
    }
    if (dHandAces > 0) { 
        if ((dealerSum + 11 + (dHandAces - 1)) > 21) { 
            dealerSum += dHandAces 
        } else { 
            dealerSum += 11 + (dHandAces - 1)
        }
    }

    if (isDealerTurn === false) {
        value = dealerHand[0].code.charAt(0)
        if (value === "A") { 
            dealerSumShow += 11
         
        } else if (value === "1" || value === "J" || value === "Q" || value === "K") {
            dealerSumShow += 10
        } else { 
            dealerSumShow += parseInt(value) 
        }
    }

  

    //Now we check for Point logic
    //check if player is over 21, then they burst
    if (playerSum > 21) {
        message = "BUST! You lose!"
        roundOver = true //set flag
        myModal.style.display = "block"; //display the modal
        playBn1.textContent = "Play Again"



        return
    }



    //Dealer Busts
    if (dealerSum > 21) {
        message = "DEALER BUST! You Win!"
        roundOver = true //Mark round as over
        //Stats tracking
 
        myModal.style.display = "block";
        playBn1.textContent = "Play Again"


        return
    }

    //now check for winner once the game is over
    if (roundOver === true) {
        if (playerSum > dealerSum) { //Player's total is greater than dealer. Player wins
            message = "You WIN"
            roundOver = true 
            myModal.style.display = "block";
            playBn1.textContent = "Play Again"

            return
        } else if (playerSum < dealerSum) { //same logic but for dealer
            message = "You LOSE"
            roundOver = true 
            myModal.style.display = "block";
            playBn1.textContent = "Play Again"

          
            return
        } else if (playerSum === dealerSum) { 
            message = "Tie!"
            roundOver = true 
            myModal.style.display = "block";
            playBn1.textContent = "Play Again"

            
            return
        }
    }
}


//stay button logic
async function stay_card() {
    if (roundOver === false) { 
        isDealerTurn = true 
        if (dealerSum < dealerDrawTo) { //checks to see if dealer point is less than 17
            await get_card_dealer();
            renderGame()
        } else { //else we end the game and count point
            roundOver = true
            renderGame()
            myModal.style.display = "block";

        }
    }
}
//hit logic
async function hit_card() {
    if (roundOver === false) { //Flag to pervent people clicking if the game is njot over
        await get_card_player();
        renderGame()
    }
}



