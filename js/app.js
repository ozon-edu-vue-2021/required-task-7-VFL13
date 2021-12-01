const persons = await fetch("data.json")
    .then(response => response.json())

const personView = document.getElementById('person-view')
const friendsView = document.getElementById('friends-View')
const detailTitle = document.getElementById('title')
const backButton = document.getElementById('back')
const personList = document.getElementById('contacts-list')
const friendsList = document.getElementById('friends-list')
const randomList = document.getElementById('random-list')
const popularList = document.getElementById('popular-list')


const getRandom = (min, max, exclude = []) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    let random = null
    while (random === null || exclude.includes(random)) {
        random = Math.floor(Math.random() * (max - min) + min);
    }
    return random
};

const createPersonElement = (person, id, isFriend) => {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.innerText = person.name
    if (isFriend) {
        const i = document.createElement('i');
        i.classList.add('fa', 'fa-male')
        li.appendChild(i);
        li.dataset.remove = "true"
    }
    else {
        li.dataset.id = id
        li.dataset.onClick = "detail"
    }
    li.appendChild(strong);
    return li
}

const personFormatter = (persons) => {
    const personsObj = {}
    persons.forEach(person => {
        const {id, name, friends} = person
        personsObj[id] = {
            name,
            friends,
            inFriends: personsObj.hasOwnProperty(id) ? personsObj[id].inFriends : 0
        }
        friends.forEach(friend_id => {
            if (personsObj.hasOwnProperty(friend_id)) {
                personsObj[friend_id].inFriends += 1
            }
            else {
                personsObj[friend_id] = {inFriends: 1}
            }
        })
    })
    return personsObj
}

const popularPerson = (formattedPerson) => {
    return Object.keys(formattedPerson).sort((personA, personB) =>
        formattedPerson[personB].inFriends - formattedPerson[personA].inFriends ||
        formattedPerson[personA].name.localeCompare(formattedPerson[personB].name)
    ).slice(0,3)
}

const personsFromId = (arr, object) => {
    return Object.fromEntries(arr.map(id => [id, object[id]]))
}

const createPersonList = (persons, isFriend = false) => {
    return Object.keys(persons).map(person => createPersonElement(persons[person], person, isFriend))
}

const renderList = (element, list) => {
    list.forEach(item => element.appendChild(item))
}

const renderFriendsList = (element, list) => {
    list.forEach(item => element.after(item))
}



const formattedPerson = personFormatter(persons)
const popular = popularPerson(formattedPerson)
const popularObjs = personsFromId(popular, formattedPerson)
renderList(personList, createPersonList(formattedPerson))




document.addEventListener('click',function(e){
    if(e.target && e.target.dataset.onClick === 'detail'){
        const {name, friends} = formattedPerson[e.target.dataset.id]
        const exclude = [...friends, ...popular.map(id => parseInt(id))]
        const randomArr = [...Array(3)].reduce((acc, _) => {
            const randomId = getRandom(1, persons.length, [...exclude, ...acc])
            acc.push(randomId)
            return acc
        }, []);
        const randomObjs = personsFromId(randomArr, formattedPerson)
        const friendsObj = personsFromId(friends, formattedPerson)
        renderFriendsList(friendsList, createPersonList(friendsObj, true))
        renderFriendsList(randomList, createPersonList(randomObjs, true))
        renderFriendsList(popularList, createPersonList(popularObjs, true))
        personView.classList.remove("selected");
        friendsView.classList.add("selected");
        detailTitle.innerText = name
    }
});

backButton.addEventListener('click',function(e){
  personView.classList.add("selected");
  friendsView.classList.remove("selected");
  const elementsToRemove = document.querySelectorAll("[data-remove]")
  elementsToRemove.forEach(li => li.remove())
});

