let container = document.querySelector('.container');
let countContainer = document.querySelector(".quests-count");
let countSpan = document.querySelector(".quests-count span");
let bulletsSpanContainer = document.querySelector(".bullets");
let quizArea = document.querySelector(".quiz-area");
let answersArea = document.querySelector(".answers-area");
let submitButton = document.querySelector(".submit-button");
let countdownElement = document.querySelector(".countdown");
let selectCategories = document.querySelector(".quests-category");

// Set Options
let currentIndex = 0;
let rightAnswers = 0;
let countdownInterval;

function getQuestions() {

    let myRequest = new XMLHttpRequest();

    myRequest.onreadystatechange = function () {

        if (this.readyState == 4 && this.status == 200) {

            let questionsObject = JSON.parse(this.responseText);

            // Get Category
            getCategoy(questionsObject[0]);

            // Clear Data
            countContainer.classList.add('hidden');
            countdownElement.classList.add('hidden');
            submitButton.classList.add('hidden');
            container.classList.add('sp_height');

            document.addEventListener('click', function (e) {
                if (questionsObject[0][e.target.value]) {
                    let targetedCategory = e.target.value;
                    // let qCount = questionsObject[0][targetedCategory].length;

                    // Get all available questions
                    let allQuestions = [];
                    Object.values(questionsObject[0][targetedCategory]).forEach(category => {
                        allQuestions = allQuestions.concat(category);
                    });

                    // Choose ten random questions
                    let randomQuestions = chooseRandomQuestions(allQuestions, 10);
                    let qCount = randomQuestions.length; // Use the count of random questions

                    // Retrieve Data
                    countContainer.classList.add('visible');
                    countdownElement.classList.add('visible');
                    submitButton.classList.add('visible');
                    container.classList.add('norm_height');

                    // Clear Data
                    quizArea.innerHTML = '';
                    answersArea.innerHTML = '';
                    bulletsSpanContainer.innerHTML = '';

                    // Create Bullets + Set Questions Count
                    createBullets(qCount);

                    // Add Question Data
                    addQuestionData(randomQuestions[currentIndex], qCount);

                    // Start CountDown
                    clearInterval(countdownInterval);
                    countdown(120, qCount);

                    // Click On Submit
                    submitButton.onclick = () => {
                        // Get Right Answer
                        let theRightAnswer = randomQuestions[currentIndex].right_answer;
                        console.log(theRightAnswer)

                        // Increase Index
                        currentIndex++;

                        // Check The Answer
                        checkAnswer(theRightAnswer, qCount);

                        // Remove Previous Question
                        quizArea.innerHTML = "";
                        answersArea.innerHTML = "";

                        // Add Question Data
                        addQuestionData(randomQuestions[currentIndex], qCount);

                        // Handle Bullets Class
                        handleBullets();

                        // Start CountDown
                        clearInterval(countdownInterval);
                        countdown(120, qCount);

                        // Show Results
                        showResults(qCount);
                    };
                }
            });
        }
    };

    myRequest.open('GET', 'quests.json', true);
    myRequest.send();
}

getQuestions()

function chooseRandomQuestions(questions, count) {
    let shuffledQuestions = [];
    let indexArray = [];
    let totalQuestions = questions.length;
  
    while (indexArray.length < count) {
        let randomIndex = Math.floor(Math.random() * totalQuestions);
        if (!indexArray.includes(randomIndex)) {
            indexArray.push(randomIndex);
            shuffledQuestions.push(questions[randomIndex]);
        }
    }
  
    return shuffledQuestions;
}

function getCategoy(obj) {
    let categories = Object.keys(obj);

    for (let i = 0; i < categories.length; i++) {
        // Create Select Options
        let opt = document.createElement('option');

        // Create Option Text
        let optText = document.createTextNode(categories[i]);

        // Add Value to Option element
        opt.value = categories[i];

        // Append Option Text to Option Element
        opt.appendChild(optText);

        // Append Option Element to select Element
        selectCategories.appendChild(opt);
    }
}

function createBullets(num) {
    countSpan.innerHTML = num.toString().padStart(2, '0');
  
    // Create Spans
    for (let i = 0; i < num; i++) {
        // Create Bullet
        let theBullet = document.createElement("span");
    
        // Check If Its First Span
        if (i === 0) {
            theBullet.className = "on";
        }
    
        // Append Bullets To Main Bullet Container
        bulletsSpanContainer.appendChild(theBullet);
    }
}

function addQuestionData(obj, count) {
    if (currentIndex < count) {
        // Create Span Question Title
        let questionTitle = document.createElement("span");

        // Add Class To Span
        questionTitle.className = 'quest';

        // Create Question Text
        let questionText = document.createTextNode(obj["title"]);

        // Append Text To Span
        questionTitle.appendChild(questionText);

        // Append The Span To The Container
        quizArea.appendChild(questionTitle);

        // Shuffle and Create Shuffled Answers Array
        let shuffledAnswers = shuffleNoRepeat(Object.values(obj.answers));

        // Create Main Answer Div
        let mainDiv = document.createElement("div");

        // Add Class To Main Div
        mainDiv.className = "options";

        // Create The Answers
        for (let i = 0; i < 4; i++) {
            // Create Answer Span
            let span = document.createElement("span");

            span.addEventListener('click', function (e) {
                // Get Clicked Spans
                let spans = document.querySelectorAll(".clicked");
                [].forEach.call(spans, function (el) {
                    // Remove ClicledClass from All Spans
                    el.classList.remove("clicked");
                });
                // Add ClickedClass To Clicked Span
                e.target.classList.add("clicked");
            })

            // Add Span To Main Div
            mainDiv.appendChild(span);
            
            // Add Id + Data-Attribute
            span.innerHTML = shuffledAnswers[i];
            span.dataset.answer = shuffledAnswers[i];
            
            // Append All Spans To Container
            answersArea.appendChild(mainDiv);
        }
    }
}

function shuffleNoRepeat(arr) {
    const shuffledArray = arr.slice(); // Create a copy of the original array
    let currentIndex = arr.length;
    let temporaryValue, randomIndex;
  
    // While there are elements to shuffle
    while (currentIndex !== 0) {
        // Pick a remaining element
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
    
        // Swap with the current element
        temporaryValue = shuffledArray[currentIndex];
        shuffledArray[currentIndex] = shuffledArray[randomIndex];
        shuffledArray[randomIndex] = temporaryValue;
    
        // Check if the current element is the same as the next element
        if (currentIndex !== 0 && shuffledArray[currentIndex] === shuffledArray[currentIndex - 1]) {
            // Swap again to avoid consecutive repetition
            temporaryValue = shuffledArray[currentIndex];
            shuffledArray[currentIndex] = shuffledArray[randomIndex];
            shuffledArray[randomIndex] = temporaryValue;
        }
    }
  
    return shuffledArray;
}

function checkAnswer(rAnswer, count) {
    let answers = document.querySelectorAll(".options span");
    
    let theChoosenAnswer;

    for (let i = 0; i < answers.length; i++) {
        if (answers[i].classList.contains('clicked')) {
            theChoosenAnswer = answers[i].dataset.answer;
            console.log(theChoosenAnswer)
            console.log(rAnswer)
        }
    }

    if (rAnswer === theChoosenAnswer) {
        rightAnswers++;
        console.log('yes')
    }
}

function handleBullets() {
    let bulletsSpans = document.querySelectorAll(".bullets span");
    let arrayOfSpans = Array.from(bulletsSpans);
    arrayOfSpans.forEach((span, index) => {
        if (currentIndex === index) {
            span.className = "on";
        }
    });
}

function countdown(duration, count) {
    if (currentIndex < count) {
        let minutes, seconds;
        countdownInterval = setInterval(function () {
            minutes = parseInt(duration / 60);
            seconds = parseInt(duration % 60);
    
            minutes = minutes < 10 ? `0${minutes}` : minutes;
            seconds = seconds < 10 ? `0${seconds}` : seconds;
    
            countdownElement.innerHTML = `Time: ${minutes}:${seconds}`;
    
            if (--duration < 0) {
                clearInterval(countdownInterval);
                submitButton.click();
            }
        }, 1000);
    }
}

function showResults(count) {
    let theResults;
    if (currentIndex === count) {
        quizArea.remove();
        answersArea.remove();
        submitButton.remove();
        bulletsSpanContainer.remove();
        selectCategories.remove();
        countContainer.remove();
        countdownElement.remove();

        // Create Result Container
        let resultsContainer = document.createElement('div');
        
        // Add Class To Results Container
        resultsContainer.className = 'results';
        
        // Append Results to The container
        container.appendChild(resultsContainer);
    
        if (rightAnswers > count / 2 && rightAnswers < count) {
            theResults = `<span class="good">Good</span> <span class="count">You got ${rightAnswers} Out of ${count}</span>`;
        } else if (rightAnswers === count) {
            theResults = `<span class="perfect">Perfect</span> <span class="count">All Answers Is Right</span>`;
        } else {
            theResults = `<span class="bad">Bad</span> <span class="count">You got ${rightAnswers} Out of ${count}</span>`;
        }

        container.classList.add('sp_cont_styles');
    
        resultsContainer.innerHTML = theResults;
    }
}