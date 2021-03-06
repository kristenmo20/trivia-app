if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("serviceworker.js");
}

const userName = "username";

let peer;
let conn;
let session;

function fetchUser() {
    return localStorage.getItem(userName);
}

function setUser(value) {
    if (value) {
        localStorage.setItem(userName, value);
    } else {
        localStorage.removeItem(userName);
    }
    refreshUser();
}

function refreshScoreboard(players) {
    const currentUser = fetchUser();
    const scoreboardElement = document.querySelector("#scoreboard");
    const template = document.querySelector("#tplPlayer");

    players = players.map(player => {
        let { username, score } = player;
        const playerElement = template.content.cloneNode(true);

        if (username === currentUser) {
            username += " - You";
            playerElement.firstElementChild.classList.add("current-user");
        }

        playerElement.querySelector(".player-username").innerText = username;
        playerElement.querySelector(".player-score").innerText = score;

        return playerElement.firstElementChild.outerHTML;
    }).join("");

    scoreboardElement.innerHTML = players;
}

function onLogin(event) {
    event.preventDefault();
    const targetElement = event.target;
    const usernameElement = targetElement.querySelector("input[name=username]");
    const user = usernameElement.value || fetchUser();
    const codeElement = targetElement.querySelector("input[name=code]");
    if (user) {
        session = codeElement.value;
        setUser(user);
    }
}

function onLogout() {
        setUser(null);
        refreshScoreboard([]);
        refreshQuestion();
    }

function refreshUser() {
    const user = fetchUser();
    const logoutElement = document.querySelector("#log-out");

    if (peer) {
        peer.destroy();
        peer = null;
    }

    let loginElement = document.querySelector(".loginForm");
    if (user && session !== void 0) {
        peer = new Peer(`trivia-app-${user}`);
        peer.on("open", peerOpen);
        peer.on("close", peerClose);

        if (loginElement) {
            loginElement.addEventListener("animationed", () => {
                loginElement.remove();
            });
            loginElement.classList.add("puff-out-center");
        }
    } else {
        if (!loginElement) {
            const template = document.querySelector("#tplLoginForm");
            loginElement = template.content.cloneNode(true).firstElementChild;
            document.body.append(loginElement);
        }
        loginElement.querySelector(".user-login").classList.toggle("hidden", !!user);
    }
}

function placeholderData() {
    refreshScoreboard([{
        username: fetchUser(),
        score: 50
    }, {
        username: "Jim",
        score: 70
    }, {
        username: "Dwight",
        score: 70
    }]);

    refreshQuestion({
        text: "What is the acronym for Hyper Text Markup Language?",
        type: "radio",
        moreQuestions: true,
        options: [{
            text: "HTML",
            valid: true
        }, {
            text: "XML",
            valid: false
        },{
            text: "CSS",
            valid: false
        },{
            text: "XHTML",
            valid: false
        }]
    });
}

function refreshQuestion(data) {
    const questionContent = document.querySelector("#questionContent");
    const prevQuestionElement = questionContent.firstElementChild;

    if (data) {
        const template = document.querySelector("#tplQuestion");
        const questEl = template.content.cloneNode(true);
        const questionEl = questEl.firstElementChild;

        let { text, type, options, moreQuestions } = data;
        questEl.querySelector(".question-text").innerText = text;

        const isRadio = type === "radio";
        options = options.map((option, index) => {
            return `<label><input type="${type}" name="${isRadio && "radio" || `${type}-index`}">${option.text}</label>`;
        }).join("");
        questEl.querySelector(".question-options").innerHTML = options;

        const nextQuestionEl = document.querySelector(".question-next");
        nextQuestionEl.classList.toggle("visible", false);
        nextQuestionEl.classList.toggle("invisible", true);

        const nextActionEl = nextQuestionEl.querySelector("#question-next-action");
        if (moreQuestions) {
            nextActionEl.innerText = "Next";
        } else {
            nextActionEl.innerText = "End";
        }
        nextActionEl.classList.toggle("end", !moreQuestions);

        const toggleQuestionElement = () => {
            questionEl.classList.add("slide-in-left");
            questionEl.addEventListener("animationend", () => {
                nextQuestionEl.classList.toggle("invisible", false);
                nextQuestionEl.classList.toggle("visible", true);
            });
            questionContent.appendChild(questionEl);
        };

        if (prevQuestionElement) {
            prevQuestionElement.addEventListener("animationend", () => {
                prevQuestionElement.remove();
                toggleQuestionElement();
            });
            prevQuestionElement.classList.add("slide-out-right");
        } else {
            toggleQuestionElement();
        }
    } else if (prevQuestionElement) {
        prevQuestionElement.remove();
    }

    window.currentQuestion = data;
}



function onNextClick() {
    const currentQuestion = window.currentQuestion;
    if (currentQuestion) {
        const { type, moreQuestions, options } = currentQuestion;

        const optionsEl = [...document.querySelector(".question-options").childNodes];
        const selectedOptions = [];
        options.forEach((option, index) => {
            const optionEl = optionsEl[index];
            if (optionEl
                && ((optionEl.firstElementChild
                    && optionEl.firstElementChild.checked) || optionEl.value)) {
                selectedOptions.push(option);
            }
        });

        if (moreQuestions) {
            refreshQuestion({
                text: "What is the opposite of right?",
                type: "radio",
                moreQuestions: false,
                options: [{
                    text: "Up",
                    valid: false
                }, {
                    text: "Down",
                    valid: false
                }, {
                    text: "Diagonal",
                    valid: false
                }, {
                    text: "Left",
                    valid: true
                }]
            });
        } else {
            //Do nothing.
        }
    }
}

refreshUser();
if (fetchUser()) {
    placeholderData();
}

function peerOpen() {
    peer.on("connection", peerConnection);
    if (session) {
        peer.connect(session);
    }
    placeholderData();
}

function peerClose() {
    conn = null;
}

function peerConnection(newConn) {
    conn = newConn;
    conn.on("data", function(data) {
        console.log(`Data recieved: ${JSON.stringify(data)}`);
    });
}

