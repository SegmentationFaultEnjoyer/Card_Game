const socket = io();
const MAX_CARDS = 3;
let amount = 0;
let deck = [];
let setter_deck = null;
let loader = document.querySelector(".loader");

async function send_post_req(url, body) {
    let res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
        'Content-Type': 'application/json'
        }
    });
    let resp = await res.json();
    return resp;
}

getUserDecks();
async function getUserDecks() {   
    loader.style.visibility = "visible";
    let req = await fetch("/decks");
    const decks = await req.json();
    setter_deck = decks[1];
    loader.style.visibility = "hidden";
    showDecks(decks[0])
}


let showCards = cards => {
    document.getElementById("cards").innerHTML = ""
    for (let card of cards) {
        let div = document.createElement("div")
        let img = document.createElement("img");
        img.src =  `./models/assets/${card.name}.png`;
        img.alt = card.name;
        div.appendChild(img);
         
        let p = document.createElement("p");
        p.innerHTML = card.cost;
        p.setAttribute("class", "cost")
        div.appendChild(p)
        p = document.createElement("p");
        p.innerHTML = card.attack;
        p.setAttribute("class", "attack")
        div.appendChild(p)
        p = document.createElement("p");
        p.innerHTML = card.defense;
        p.setAttribute("class", "defense")
        div.appendChild(p);
        document.getElementById("cards").appendChild(div)
    }
}
document.getElementById('new_deck').addEventListener('click', e => {
    document.location = '/deck_viewer';
})

let choisen = (div, decks) => {  
    let divs = document.getElementById("decks").children;
    let cards = null
    let index = 0;
    for(let i of divs) {
        
        if (i != div)
            i.setAttribute("class", "decks_menu")
        else {
            if (i.innerText == "Starter Pack") {
                document.getElementById("delete").setAttribute("style", "display:none")
            }
            else                
                document.getElementById("delete").setAttribute("style", "display:display")
            cards = decks[index].cards;
        }
        index++;
        
        if (i.id == "div"+setter_deck) {
            i.setAttribute("style", "background-image: linear-gradient(to right, red, purple)");
        }
    }
    div.setAttribute("class", "choise");
    window.scroll(0,0);
    showCards(cards)
}

let showDecks = function (decks) {
    document.getElementById("decks").innerHTML = ""
    document.getElementById("cards").innerHTML = ""
    for (let deck of decks) {
        let div = document.createElement("div");
        let p = document.createElement("p");
        div.id = "div"+ deck.id;
        p.innerHTML = deck.name;
        p.id = deck.id;
        div.appendChild(p)
        if (div.id == "div"+setter_deck) {
            div.setAttribute("style", "background-image: linear-gradient(to right, red, purple)");
        }
        div.onclick = function(e) {
            const id = e.target.id;
            choisen(document.getElementById(`div${id}`), decks)
        }
        document.getElementById("decks").appendChild(div)
        if (deck.name == "Starter Pack") {   
            choisen(div, decks)
        }
        else {                 
            div.setAttribute("class", "decks_menu")
        }
    }
}
document.getElementById('game').addEventListener('click', e => {
    document.location = '/game';
})

document.getElementById('set').addEventListener('click', async(e) => {
    let id = document.querySelector("div[class='choise']").id.split('div')[1]
    let req = await send_post_req("/set_user_deck", {
        deck_id: id});
    setter_deck = id;
    getUserDecks()
    
})

document.getElementById('delete').addEventListener('click', async(e) => {
    let req = await send_post_req("/delete_user_deck", {
        deck_id: (document.querySelector("div[class='choise']").id).split('div')[1]});
    getUserDecks();
})
