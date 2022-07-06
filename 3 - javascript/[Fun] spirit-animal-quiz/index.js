//Start the quiz
  //Allows user to press start button and begin quiz.

    function startQuiz () {
      $('.startPage').on('click', '.startButton', function (event) {
        $('.startPage').css('display', 'none');
        $('.footer').css('display', 'none');
        $('.questionPage').css('display', 'block');
        $('.qNum').text(1);
        $('html').css('background-image', 'url(images/stars.gif)');
        generateQuestion();
    });
  }

//Return to Menu
  //Allows user to press return button to return to the main menu.
    //Resets/clears result page elements

    function mainMenu () {
      $('main').on('click', '.returnButton', function (event) {
        $('.startPage').css('display', 'block');
        $('.footer').css('display', 'block');
        $('.questionPage').css('display', 'none');
        $('.resultPage').css('display', 'none');
        qNum = 0;
        $('html').css('background-image', 'url(images/verychill.jpg)');
        Int = 0;
        Str = 0;
        Mad = 0;
        Wis = 0;
        Cha = 0;
        scoreBoard();
        displayAnswers();
        displayAnimal();
        $('.anText').css("font-family", "");
        $('.animalTitle').text('');
        $('.tier').text('');
        $('.tier').css("");
      });
  }

//Generate question and answers
  //Sequentially displays each set of questions and answers to the user as they advance thru the quiz.
  
    let qNum = 0;
        
        
  //Handles the generation and display of answers. 
  
    function displayAnswers () {
      $('.answerBox').html(generateAnswers());
}

    function generateAnswers () {
      if (qNum < STORE.length) {
        $('.a1').html(STORE[qNum].answers[0]);
        $('.a2').html(STORE[qNum].answers[1]);
        $('.a3').html(STORE[qNum].answers[2]);
        $('.a4').html(STORE[qNum].answers[3]);
      } else {
      //generateResult();
      //displayResult();
  } 
}

  //Handles the generation and display of questions.
  
    function displayQuestion (){
        $('.questionBox').html(generateQuestion());
    }

    function generateQuestion (){
      if (qNum < STORE.length) {
        $('.questionText').text(STORE[qNum].question);
      }
    }
    
    function generateNextQuestion () {
      $('form').on('submit', function (event) {
      event.preventDefault();
      nextQuestion();
      displayQuestion();
      if (qNum === 10) {
      generateResult();
      }
      
    function nextQuestion () {
      qNum += 1;
      if (qNum < STORE.length) {
      $('.qNum').text(qNum+1);
      }
      else {
      qNum = 10;
      generateResult();
      displayAnimal();
  }
}
      
  // Updates trait scores based on user input for each question
      
      choice = $('input[name=answers]:checked').siblings().html();
      if (choice === STORE[0].answers[0]) {
        incInt();
      } else if (choice === STORE[0].answers[1]) {
        incCha();
        incStr();
      } else if (choice === STORE[0].answers[2]) {
        incWis();
      } else if (choice === STORE[0].answers[3]) {
        incMad();
      } else if (choice === STORE[1].answers[0]) {
        incStr();
      } else if (choice === STORE[1].answers[1]) {
        incWis();
      } else if (choice === STORE[1].answers[2]) {
        incCha();
      } else if (choice === STORE[1].answers[3]) {
        incMad();
      } else if (choice === STORE[2].answers[0]) {
        incStr();
      } else if (choice === STORE[2].answers[1]) {
        incInt();
        incWis();
      } else if (choice === STORE[2].answers[2]) {
        incCha();
      } else if (choice === STORE[2].answers[3]) {
        incMad();
      } else if (choice === STORE[3].answers[0]) {
        incStrr();
      } else if (choice === STORE[3].answers[1]) {
        incWis();
        incInt();
      } else if (choice === STORE[3].answers[2]) {
        incIntt();
      } else if (choice === STORE[3].answers[3]) {
        incCha();
      } else if (choice === STORE[4].answers[0]) {
        incInt();
      } else if (choice === STORE[4].answers[1]) {
        incWis();
      } else if (choice === STORE[4].answers[2]) {
        incStr();
        incCha();
      } else if (choice === STORE[4].answers[3]) {
        incStr();
        incMad();
      } else if (choice === STORE[5].answers[0]) {
        incWis();
      } else if (choice === STORE[5].answers[1]) {
        incInt();
      } else if (choice === STORE[5].answers[2]) {
        incStr();
        incCha();
      } else if (choice === STORE[5].answers[3]) {
        incMadd();
      } else if (choice === STORE[6].answers[0]) {
        incCha();
      } else if (choice === STORE[6].answers[1]) {
        incInt();
      } else if (choice === STORE[6].answers[2]) {
        incStr();
      } else if (choice === STORE[6].answers[3]) {
        incCha();
        incMad();
      } else if (choice === STORE[7].answers[0]) {
        incCha();
      } else if (choice === STORE[7].answers[1]) {
        incInt();
      } else if (choice === STORE[7].answers[2]) {
        incWis();
      } else if (choice === STORE[7].answers[3]) {
        incMad();
      } else if (choice === STORE[8].answers[0]) {
        incStr();
        incWis();
      } else if (choice === STORE[8].answers[1]) {
        incInt();
      } else if (choice === STORE[8].answers[2]) {
        
      } else if (choice === STORE[8].answers[3]) {
        incMad();
      } else if (choice === STORE[9].answers[0]) {
        incStr();
      } else if (choice === STORE[9].answers[1]) {
        incMad();
      } else if (choice === STORE[9].answers[2]) {
        incInt();
        incWis();
      } else if (choice === STORE[9].answers[3]) {
        incCha();
      } else {
        console.log('What did you even click on?');
      }
      scoreBoard();
      displayAnswers();
  });
}
    
  //Manages the scoreboard at the top right.
    //Displays and updates values in the "Traits" box.
    
    function scoreBoard() {
      $('.traitInt').text(Int);
      $('.traitStr').text(Str);
      $('.traitMad').text(Mad);
      $('.traitWis').text(Wis);
      $('.traitCha').text(Cha);
}
  
Int = 0;
Str = 0;
Mad = 0;
Wis = 0;
Cha = 0;

function incInt () {
  Int += 1;
  return Int;
  scoreBoard();
}
function incIntt(){
  Int +=2;
  return Int;
  scoreBoard();
}
function incStr () {
  Str += 1;
  return Str;
  scoreBoard();
}
function incStrr() {
  Str += 2;
  return Str;
  scoreBoard();
}
function incMad () {
  Mad += 1;
  return Mad;
  scoreBoard();
}
function incMadd () {
  Mad += 2;
  return Mad;
  scoreBoard();
}
function incWis () {
  Wis += 1;
  return Wis;
  scoreBoard();
}
function incCha () {
  Cha += 1;
  return Cha;
  scoreBoard();
}

//Displays the result
  //Shows the user their Spirit Animal.
    //Shows the user a brief description of their animal.

  function generateResult () {
      $('html').css('background-image', 'url(images/verychill.jpg)');
      $('.questionPage').css('display', 'none');
      $('.resultPage').css('display', 'block');
}

  function displayAnimal () {
    if (Int >= 8) {
      $('.animalTitle').text('The Rat!');
      $('.animalPic').attr('src', 'images/rat.jpg');
      $('.animalPic').attr('alt', 'A clean, brown and white rat stands with its paws holding open a book in a library. It looks quite scholarly.');
      $('.anText').text('Your intelligence shines through in even the most confusing circumstances! You should become a Web Developer.');
      $('.tier').text('[Tier 4]');
      $('.tier').css("color", "purple");
    } else if (Str >= 8) {
      $('.animalTitle').text('The Lion!');
      $('.animalPic').attr('src', 'images/lion.jpg');
      $('.animalPic').attr('alt', 'A lion with thick orange mane rests, with paws crossed, on a hill in front of the mountains.');
      $('.anText').text('Your strength has no peer! You are the strongest, most confident of the animals!');
      $('.tier').text('[Tier 4]');
      $('.tier').css("color", "purple");
    } else if (Wis >= 8) {
      $('.animalTitle').text('The Owl!');
      $('.animalPic').attr('src', 'images/owl.jpg');
      $('.animalPic').attr('alt', 'A surprised looking owl with golden eyes and an unusually droopy coat of feathers rests in the snow. It almost looks like an exotic species of penguin.');
      $('.anText').text('Your wisdom knows no bounds! Surely hours of loneliness and unremarkable surroundings have expanded your consciousness.');
      $('.tier').text('[Tier 4]');
      $('.tier').css("color", "purple");
    } else if (Cha >= 8) {
      $('.animalTitle').text('The Butterfly!');
      $('.animalPic').attr('src', 'images/butterfly.jpg');
      $('.animalPic').attr('alt', 'A vivid, rainbow butterfly rests upon a rich lavender flower in the forest.');
      $('.anText').text('I know, I know - technically not an animal. Super Charismatic! You must have tried hard to get this one. Well Done!');
      $('.tier').text('[Tier 4]');
      $('.tier').css("color", "purple");
    } else if (Mad >= 8) {
      $('.animalTitle').text('The Chaos Noodler!');
      $('.animalPic').attr('src', 'images/cthulhu.jpg');
      $('.animalPic').attr('alt', 'The large, terrible, octopus-like humanoid of fiction known as Cthulhu stands several stories tall, rising from the ocean, with glowing green eyes, amidst the crackle of lightning and breaking of wave!');
      $('.anText').css("font-family", "Rlyehian");
      $('.anText').text('Mgehyelloig mgep ymg mgepulnah lloig. Gn thornythh ymg vulgtlagln!');
      $('.tier').text('[Tier 0]');
      $('.tier').css("color", "red");
    } else if (Int >= 2 && Str >= 2 && Wis >= 2 && Mad >= 2 && Cha >= 2) {
      $('.animalTitle').text('The Cat!');
      $('.animalPic').attr('src', 'images/cat.jpg');
      $('.animalPic').attr('alt', 'An orange, furry cat with golden eyes leaps over the grass and through the air, forming what seems to be a sphere of fur with a face.');
      $('.anText').text('The Cat is a well rounded and slightly insane animal!');
      $('.tier').text('[Tier 3]');
      $('.tier').css("color", "gold");
    } else if (Int >= 3 && Str >= 3 && Wis >= 3 && Cha >= 3) {
      $('.animalTitle').text('The Dog!');
      $('.animalPic').attr('src', 'images/dog.jpg');
      $('.animalPic').attr('alt', 'Its a golden labrador retriever with bright eyes and a happy, pink tongue hanging out.');
      $('.anText').text('The Dog is a very well rounded and friendly animal! Well Done!');
      $('.tier').text('[Tier 3]');
      $('.tier').css("color", "gold");
    } else if ((Str + Cha) >= 10) {
      $('.animalTitle').text('The Wolf!');
      $('.animalPic').attr('src', 'images/wolf.jpg');
      $('.animalPic').attr('alt', 'A grey-furred, white bellied wolf stalks through the bright, white snow towards the right of the viewer.');
      $('.anText').text('The Wolf is strong and charismatic! It has the confidence and social skills to lead or contribute to the pack. Well Done!');
      $('.tier').text('[Tier 3]');
      $('.tier').css("color", "gold");
    } else if ((Int + Wis) >= 10) {
      $('.animalTitle').text('The Dolphin!');
      $('.animalPic').attr('src', 'images/dolphin.jpg');
      $('.animalPic').attr('alt', 'A dolphin jumps out of the ocean in picture perfect posture as a trail of water follows it into the air.');
      $('.anText').text('The Dolphin is intelligent and wise. What a majestic being! Well Done!');
      $('.tier').text('[Tier 3]');
      $('.tier').css("color", "gold");
    } else if ((Int + Str) >= 10) {
      $('.animalTitle').text('The Elephant!');
      $('.animalPic').attr('src', 'images/elephant.jpg');
      $('.animalPic').attr('alt', 'A young elephant stands peacefully among an open expanse of golden flowers. You can see a forest covered in mist in the far background.');
      $('.anText').text('The Elephant is intelligent and strong! Brains AND brawn! Well Done!');
      $('.tier').text('[Tier 3]');
      $('.tier').css("color", "gold");
    } else if ((Str + Wis) >= 10) {
      $('.animalTitle').text('The Bear!');
      $('.animalPic').attr('src', 'images/bear.jpg');
      $('.animalPic').attr('alt', 'A brown bear cub lays in the grass, on its back, as it stares at the viewer. The cub has a wet tail and holds its paws in the air like a dog that wants a belly rub.');
      $('.anText').text('The Bear is strong and wise! It exudes confidence and uses experience to its advantage. Well Done!');
      $('.tier').text('[Tier 3]');
      $('.tier').css("color", "gold");
    } else if (Mad >= 5) {
      $('.animalTitle').text('The Honey-Badger!');
      $('.animalPic').attr('src', 'images/honeybadger.jpg');
      $('.animalPic').attr('alt', 'A small, grizzly, black and white abomination of fur, teeth, and death pauses to growl at the viewer.');
      $('.anText').text('The Honey-Badger is just the right amount of insane and angry. Just dont mess with it.');
      $('.tier').text('[Tier 2]');
      $('.tier').css("color", "white");
    } else if (Int >= 4) {
      $('.animalTitle').text('The Monkey!');
      $('.animalPic').attr('src', 'images/monkey.jpg');
      $('.animalPic').attr('alt', 'A golden-furred monkey resting on a log stares in amazement, eyes wide and mouth agape, at something just right of the viewer.');
      $('.anText').text('The Monkey excels at using thumbs and superior intellect to peel and eat bananas. Remarkable.');
      $('.tier').text('[Tier 2]');
      $('.tier').css("color", "white");
    } else if (Str >= 4) {
      $('.animalTitle').text('The Boar!');
      $('.animalPic').attr('src', 'images/boar.jpg');
      $('.animalPic').attr('alt', 'An adult boar with dark brown fur kicks up snow as it trots through the forest. The winter sun highlights its furry silhouette.');
      $('.anText').text('The Boar is good at charging things. Thats about it.');
      $('.tier').text('[Tier 2]');
      $('.tier').css("color", "white");
    } else if (Wis >= 4) {
      $('.animalTitle').text('The Sloth!');
      $('.animalPic').attr('src', 'images/sloth.jpg');
      $('.animalPic').attr('alt', 'A light brown, very furry sloth curls its claws and lanky arms around the base of a tree in the forest. It is, apparently, asleep.');
      $('.anText').text('The Sloth is a wise, calm animal. It knows when to act, and when not to act. Mostly when not to.');
      $('.tier').text('[Tier 2]');
      $('.tier').css("color", "white");
    } else if (Mad >= 4) {
      $('.animalTitle').text('The Anteater!');
      $('.animalPic').attr('src', 'images/anteater.jpg');
      $('.animalPic').attr('alt', 'A brown and white anteater with a large, bushy tail sits up on its hindlegs. Its eyes are closed and its noodle-like tongue is fully extended. It looks euphoric, as if tasting the breeze.');
      $('.anText').text('The Anteater is a curious creature. It licks things just for the sake of it. At least you didnt get the snake.');
      $('.tier').text('[Tier 2]');
      $('.tier').css("color", "white");
    } else if (Cha >= 4) {
      $('.animalTitle').text('The Armadillo!');
      $('.animalPic').attr('src', 'images/armadillo.jpg');
      $('.animalPic').attr('alt', 'A baby armadillo with leathery scales and tufts of hair on its belly is scuttled in the sand.');
      $('.anText').text('The Armadillo is friendly and charming. It gets along with most others and does not excel in any particular area.');
      $('.tier').text('[Tier 2]');
      $('.tier').css("color", "white");
    } else {
      $('.animalTitle').text('The Snake!');
      $('.animalPic').attr('src', 'images/snake.jpg')
      $('.animalPic').attr('alt', 'A small, yellow scaled, orange and black spotted snake is holding its mouth wide open, as though it just received a Nintendo Switch for Christmas.');
      $('.anText').text('A little spaghetti boi. Nothing remarkable.');
      $('.tier').text('[Tier 1]');
      $('.tier').css("color", "grey");
    }
  }

//Implement Functions
  //Loads the quiz

function load() {
  startQuiz();
  mainMenu();
  generateAnswers();
  displayAnswers();
  generateQuestion();
  displayQuestion();
  generateNextQuestion();
  scoreBoard();
}

$(load);
