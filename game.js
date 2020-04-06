const USER_NAME = "username";

function fetchUser() {
    return localStorage.getItem(USER_NAME);
}

function setUser(value) {
    if (value) {
        localStorage.setItem(USER_NAME, value);
    } else {
        localStorage.removeItem(USER_NAME);
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
    const parentElement = targetElement.parentElement;
    const value = targetElement.querySelector("input[type=text]").value;
    if (value) {
        setUser(value);
        placeholderData();
    }
}

function onLogout() {
        setUser(null);
        refreshScoreboard([]);
        refreshQuestion();
    }

function refreshUser() {
    const user = fetchUser();
    let loginElm = document.querySelector(".loginForm");
    if (user) {
        if (loginElm) {
            loginElm.addEventListener("animationend", () => {
                loginElm.remove();
            });
            loginElm.classList.add("puff-out-center");
        }
    } else {
        if (!loginElm) {
            const template = document.querySelector("#tplLoginForm");
            loginElm = template.content.cloneNode(true);
            document.body.append(loginElm.firstElementChild);
        }
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
            return `<label><input type="${type}" name="${isRadio && "radio" || `${type}-index`
                }">${option.text}</label>`;
        }).join("");
        questEl.querySelector(".question-options").innerHTML = options;

        const nextQuestionEl = document.querySelector(".question-next");
        nextQuestionEl.classList.toggle("show", false);
        nextQuestionEl.classList.toggle("hide", true);

        const nextActionEl = nextQuestionEl.querySelector("#question-next-action");
        if (moreQuestions) {
            nextActionEl.innerText = "Next";
        } else {
            nextActionEl.innerText = "Finish";
        }
        nextActionEl.classList.toggle("finish", !moreQuestions);

        const toggleQuestionElement = () => {
            questionEl.classList.add("slide-in-left");
            questionEl.addEventListener("animationend", () => {
                nextQuestionEl.classList.toggle("hide", false);
                nextQuestionEl.classList.toggle("show", true);
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
                    && optionEl.firstElementChild.checked)
                    || optionEl.value)) {
                selectedOptions.push(option);
            }
        });

        if (!selectedOptions.length && !confirm("Are you sure, do you want to skip this question?")) {
            return false;
        }

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
                    text: "left",
                    valid: true
                }]
            });
        } else {

        }
    }
}

refreshUser();
if (fetchUser()) {
    placeholderData();
}