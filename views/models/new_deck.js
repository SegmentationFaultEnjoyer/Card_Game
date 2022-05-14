const socket = io();
const MAX_CARDS = 15;
let amount = 0;
let deck = []
let loader = document.querySelector(".loader");
async function getCards() {   
    loader.style.visibility = "visible";
    let req = await fetch("/get_cards");
    
    const cards = await req.json();
    cards.sort((a, b) => a.cost - b.cost)
    loader.style.visibility = "hidden";
    showCards(cards)
}
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

async function postDeck(name) {
    
    let req = await send_post_req("/post_deck", {deck: deck, name:name});
    
}

getCards();

function showNotification(text, buttons, input = false) {
    
    document.getElementById("cards").pointerEvents='none';
    let div = document.createElement("div")
    div.id = "notification"
    let p = document.createElement("p");
    p.innerHTML = text;
    div.appendChild(p);

    if (input)  {
        let check = document.createElement("input");
        check.setAttribute("type", "text")  
        div.appendChild(check)
    }
    for (let i in buttons) {
        let butt = document.createElement("input");
        butt.setAttribute("type", "reset")   

        butt.value = buttons[i].value;

        butt.addEventListener("click", buttons[i].callback)
        butt.style.right = `calc(1% + ${i*105}px)`
        
        div.appendChild(butt)
    }
     

    document.getElementsByTagName("body")[0].appendChild(div)
}

document.getElementById('submit').addEventListener('click', e => {
    if(amount < MAX_CARDS) {
        showNotification("Недостаточно карт для создания новой колоды.", [{value: "Закрыть", callback: () => {
            document.getElementsByTagName("body")[0].removeChild( document.getElementsByTagName("body")[0].lastChild)
        }}])
    }
    else {
        showNotification("Введите название колоды.", [
        {value: "Закрыть", callback: () => {
            document.getElementsByTagName("body")[0].removeChild( document.getElementsByTagName("body")[0].lastChild)
        }}, 
        {value: "Создать", callback: async() => {
            let value = document.querySelector("input[type=text]").value
            document.getElementsByTagName("body")[0].removeChild( document.getElementsByTagName("body")[0].lastChild)
            document.getElementsByTagName("body")[0].removeChild( document.getElementById("cards"))
            document.getElementsByTagName("body")[0].removeChild( document.getElementById("game"))
            document.getElementsByTagName("body")[0].removeChild( document.getElementById("submit"))
            document.getElementsByTagName("body")[0].removeChild( document.getElementById("amount"))
            
            loader.style.visibility = "visible";
            await postDeck(value);
            document.location = '/decks_viewer';
        }}], true)
    }
})

let showCards = function (cards) {    
    for (let card of cards) {
        let div = document.createElement("div")
        let img = document.createElement("img");
        img.src =  `./models/assets/${card.name}.png`;
        img.id = "img"+card.id;
        img.alt = card.name;
        img.addEventListener("click", e => {
            let check = document.getElementById((e.currentTarget.id).split("img")[1]);
            check.checked = !check.checked ? true : false
            if(check.checked && amount < MAX_CARDS)  {
                amount++;
                deck.push(check.id)
            }
            else if (!check.checked) {
                deck.splice(deck.indexOf(check.id), 1);
                amount--;
            }
            else {
                check.checked = false;
            }
            document.getElementById("amount").innerHTML = amount + "/" + MAX_CARDS;
        })
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
        
        let check = document.createElement("input");
        check.setAttribute("type", "checkbox")    
        div.appendChild(check)
        check.id = card.id;
        check.addEventListener("change", e => {
            if(e.currentTarget.checked && amount < MAX_CARDS)  {
                amount++;
                deck.push(e.currentTarget.id)
            }
            else if (!e.currentTarget.checked) {
                deck.splice(deck.indexOf(e.currentTarget.id), 1);
                amount--;
            }
            else {
                e.currentTarget.checked = false;
            }
            document.getElementById("amount").innerHTML = amount + "/" + MAX_CARDS;
        })
        document.getElementById("cards").appendChild(div)
    }
}
document.getElementById('game').addEventListener('click', e => {
    document.location = '/decks_viewer';
})
