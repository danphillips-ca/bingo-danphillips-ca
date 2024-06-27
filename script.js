function toggleFullscreen() {
    var navbarCollapse = document.getElementById('navbarNav');
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
    }
    if (navbarCollapse.classList.contains('show')) {
        var bsCollapse = new bootstrap.Collapse(navbarCollapse, {
            toggle: false
        });
        bsCollapse.hide();
    }
}

// Function to delete a cookie by name
function deleteCookie(name) {
    console.log('Deleting cookie:', name);
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
    console.log('Cookie deleted. Reloading page...');
    location.reload();
}

// Function to shuffle an array
function shuffle(array) {
    console.log('Shuffling array:', array);
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    console.log('Shuffled array:', array);
    return array;
}

// Function to set a cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Function to get a cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Function to parse URL parameters
function getUrlParameter(name) {
    const url = new URL(window.location.href);
    const param = url.searchParams.get(name);
    return param ? decodeURIComponent(param) : null;
}

// Function to initialize the game
function initializeGame() {
    if (gameData) {
        document.getElementById('gameTitle').innerText = gameData.title;

        const bingoGrid = document.getElementById('bingoGrid');
        const keys = Object.keys(gameData).filter(key => key !== 'title' && key !== 'Free');

        bingoGrid.innerHTML = '';

        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 5; col++) {
                const card = document.createElement('div');
                card.className = 'bingo-card';

                if (row === 0) {
                    card.classList.add('tile-header');
                    card.innerText = keys[col];
                } else {
                    card.classList.add('tile-content');
                    if (row === 3 && col === 2) {
                        const freeItems = gameData['Free'];
                        const freeText = freeItems[Math.floor(Math.random() * freeItems.length)];
                        card.innerHTML = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                                            <div>${freeText}</div>
                                            <div class="free-space">Free Space</div>
                                          </div>`;
                    } else {
                        const listKey = keys[col];
                        if (gameData[listKey] && gameData[listKey][row - 1]) {
                            card.innerText = gameData[listKey][row - 1];
                        }
                    }
                    card.addEventListener('click', () => {
                        card.classList.toggle('selected');
                    });
                }
                bingoGrid.appendChild(card);
            }
        }
    }
}

function shuffleGameData(data) {
    console.log('Shuffling game data:', data);
    for (let key in data) {
        if (Array.isArray(data[key])) {
            shuffle(data[key]);
        }
    }
    console.log('Shuffled game data:', data);
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', (event) => {
    console.log('Page loaded. Initializing game...');
    initializeGame();
});

let gameData = null;
const cookieData = getCookie('bingoGameData');
const base64Data = getUrlParameter('data');

console.log('Cookie data:', cookieData);
console.log('URL data:', base64Data);

try {
    if (cookieData) {
        const cookieObject = JSON.parse(cookieData);
        console.log('Parsed cookie object:', cookieObject);
        if (base64Data && base64Data === cookieObject.original) {
            gameData = cookieObject.shuffled;
            console.log('Using shuffled data from cookie:', gameData);
            initializeGame();
        } else if (base64Data) {
            try {
                gameData = JSON.parse(atob(base64Data));
                console.log('Parsed URL data:', gameData);
                shuffleGameData(gameData);
                shuffledGameData = gameData;
                console.log('Shuffled new game data:', shuffledGameData);
                setCookie('bingoGameData', base64Data, shuffledGameData, 7);
                initializeGame();
            } catch (e) {
                console.error('Error parsing game data from URL:', e);
            }
        } else {
            gameData = cookieObject.shuffled;
            console.log('Using shuffled data from cookie:', gameData);
            initializeGame();
        }
    } else if (base64Data) {
        try {
            gameData = JSON.parse(atob(base64Data));
            console.log('Parsed URL data:', gameData);
            shuffleGameData(gameData);
            shuffledGameData = gameData;
            console.log('Shuffled new game data:', shuffledGameData);
            setCookie('bingoGameData', base64Data, shuffledGameData, 7);
            initializeGame();
        } catch (e) {
            console.error('Error parsing game data from URL:', e);
        }
    } else {
        console.error('No game data found in URL or cookie.');
    }
} catch (e) {
    console.error('Error handling game data:', e);
}
