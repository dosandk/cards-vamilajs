// JavaScript Document
document.addEventListener("DOMContentLoaded", () => {

    function stackedCards () {

        var stackedOptions = 'Top'; //Change stacked cards view from 'Bottom', 'Top' or 'None'.
        var rotate = true; //Activate the elements' rotation for each move on stacked cards.
        var items = 3; //Number of visible elements when the stacked options are bottom or top.
        var elementsMargin = 10; //Define the distance of each element when the stacked options are bottom or top.
        var useOverlays = true; //Enable or disable the overlays for swipe elements.
        var maxElements; //Total of stacked cards on DOM.
        var currentPosition = 0; //Keep the position of active stacked card.
        var velocity = 0.3; //Minimum velocity allowed to trigger a swipe.
        var rightObj; //Keep the swipe right properties.
        var listElNodesObj; //Keep the list of nodes from stacked cards.
        var listElNodesWidth; //Keep the stacked cards width.
        var currentElementObj; //Keep the stacked card element to swipe.
        var stackedCardsObj;
        var isFirstTime = true;
        var elementHeight;
        var obj;
        var elTrans;

        obj = document.getElementById('stacked-cards-block');
        stackedCardsObj = obj.querySelector('.stackedcards-container');
        listElNodesObj = stackedCardsObj.children;

        rightObj = obj.querySelector('.stackedcards-overlay.right');

        countElements();
        currentElement();
        changeBackground();
        listElNodesWidth = stackedCardsObj.offsetWidth;
        currentElementObj = listElNodesObj[0];
        updateUi();

        //Prepare elements on DOM
        let addMargin = elementsMargin * (items -1) + 'px';

        if(stackedOptions === "Top"){

            for(let i = items; i < maxElements; i++){
                listElNodesObj[i].classList.add('stackedcards-top', 'stackedcards--animatable', 'stackedcards-origin-top');
            }

            elTrans = elementsMargin * (items - 1);

            stackedCardsObj.style.marginBottom = addMargin;

        } else if(stackedOptions === "Bottom"){


            for(let i = items; i < maxElements; i++){
                listElNodesObj[i].classList.add('stackedcards-bottom', 'stackedcards--animatable', 'stackedcards-origin-bottom');
            }

            elTrans = 0;

            stackedCardsObj.style.marginBottom = addMargin;

        } else if (stackedOptions === "None"){

            for(let i = items; i < maxElements; i++){
                listElNodesObj[i].classList.add('stackedcards-none', 'stackedcards--animatable');
            }

            elTrans = 0;

        }

        for (let i = items; i < maxElements; i++){
            listElNodesObj[i].style.zIndex = 0;
            listElNodesObj[i].style.opacity = 0;

            listElNodesObj[i].style.transform ='scale(' + (1 - (items * 0.04)) +') translateX(0) translateY(' + elTrans + 'px) translateZ(0)';
        }

        if (listElNodesObj[currentPosition]){
            listElNodesObj[currentPosition].classList.add('stackedcards-active');
        }

        if (useOverlays){
            rightObj.style.transform = 'translateX(0px) translateY(' + elTrans + 'px) translateZ(0px) rotate(0deg)';
        } else {
            rightObj.className = '';
            rightObj.classList.add('stackedcards-overlay-hidden');
        }

        //Remove class init
        setTimeout(() => {
            obj.classList.remove('init');
        },150);


        function backToMiddle() {

            removeNoTransition();
            transformUi(0, 0, 1, currentElementObj);

            if(useOverlays){
                transformUi(0, 0, 0, rightObj);
            }

            setZindex(5);

            if(!(currentPosition >= maxElements)){
                //roll back the opacity of second element
                if((currentPosition + 1) < maxElements){
                    listElNodesObj[currentPosition + 1].style.opacity = '.8';
                }
            }
        };

        // Usable functions
        function countElements() {
            maxElements = listElNodesObj.length;
            if(items > maxElements){
                items = maxElements;
            }
        };

        //Keep the active card.
        function currentElement() {
            currentElementObj = listElNodesObj[currentPosition];
        };

        //Change background for each swipe.
        function changeBackground() {
            document.body.classList.add("background-" + currentPosition + "");
        };

        //Change states
        function changeStages() {
            if (currentPosition == maxElements){
                //Event listener created to know when transition ends and changes states
                const score = document.getElementById('score').innerText;
                const finalScore = document.getElementById('final-score');

                finalScore.innerText = score;

                listElNodesObj[maxElements - 1].addEventListener('transitionend', function(){
                    document.body.classList.add("background-7");
                    document.querySelector('.stage').classList.add('hidden');
                    document.querySelector('.final-state').classList.remove('hidden');
                    document.querySelector('.final-state').classList.add('active');
                    listElNodesObj[maxElements - 1].removeEventListener('transitionend', null, false);
                });
            }
        };

        //Functions to swipe left elements on logic external action.
        // false

        function changeProgress () {
            const $progress = document.getElementById('progress-line');
            const $score = document.getElementById('score');
            const width = $progress.style.width || 0;

            $progress.style.width = parseInt(width, 10) + 50 + '%';
            $score.innerText = parseInt($score.innerText, 10) + 1;
        }

        function checkAnswer (position, cb, rotate = true) {
            const $card = document.querySelector('.js-active');
            const { status, checked } = $card.dataset;
            const check = position === 'left' ? checked === "false" && status === "true" : checked === "false" && status === "false";

            if (check && rotate) {
                const $flipCardInner = $card.querySelector('.flip-card-inner');

                $flipCardInner.classList.add('active');
                $card.dataset.checked = "true";
            } else {
                const $cards = document.querySelectorAll('.card');
                const currentIndex = Array.from($cards).findIndex(item => item.classList.contains('js-active'));
                const $nextCard = $cards[currentIndex + 1];

                if (checked === "false" && rotate) {
                    changeProgress();
                }

                if ($nextCard) {
                    $card.classList.remove('js-active');
                    $nextCard.classList.add('js-active');
                }

                cb();
            }
        }

        function onActionLeft() {
            checkAnswer('left', () => {
                if(!(currentPosition >= maxElements)){
                    setTimeout(function() {
                        onSwipeLeft();
                        resetOverlayLeft();
                    },500);
                }
            });
        };

        //Functions to swipe right elements on logic external action.
        function onActionRight() {
            checkAnswer('right', () => {
                if(!(currentPosition >= maxElements)){
                    if(useOverlays) {
                        rightObj.classList.remove('no-transition');
                        rightObj.style.zIndex = '8';
                        transformUi(0, 0, 1, rightObj);
                    }

                    setTimeout(function(){
                        onSwipeRight();
                        resetOverlayRight();
                    },1000);
                }
            });
        };

        //Swipe active card to left.
        function onSwipeLeft() {
            removeNoTransition();
            transformUi(-1000, 0, 0, currentElementObj);
            if(useOverlays){
                resetOverlayLeft();
            }
            currentPosition = currentPosition + 1;
            updateUi();
            currentElement();
            changeBackground();
            changeStages();
            setActiveHidden();
        };

        //Swipe active card to right.
        function onSwipeRight() {
            removeNoTransition();
            transformUi(1000, 0, 0, currentElementObj);
            if(useOverlays){
                transformUi(1000, 0, 0, rightObj); //Move rightOverlay
                resetOverlayRight();
            }

            currentPosition = currentPosition + 1;
            updateUi();
            currentElement();
            changeBackground();
            changeStages();
            setActiveHidden();
        };

        //Swipe active card to top.
        function onSwipeTop() {
            removeNoTransition();
            transformUi(0, -1000, 0, currentElementObj);
            if(useOverlays){
                transformUi(0, -1000, 0, rightObj); //Move rightOverlay
                resetOverlays();
            }

            currentPosition = currentPosition + 1;
            updateUi();
            currentElement();
            changeBackground();
            changeStages();
            setActiveHidden();
        };

        //Remove transitions from all elements to be moved in each swipe movement to improve perfomance of stacked cards.
        function removeNoTransition() {
            if(listElNodesObj[currentPosition]){

                if(useOverlays) {
                    rightObj.classList.remove('no-transition');
                }

                listElNodesObj[currentPosition].classList.remove('no-transition');
                listElNodesObj[currentPosition].style.zIndex = 6;
            }

        };

        //Move the overlay left to initial position.
        function resetOverlayLeft() {
            if(!(currentPosition >= maxElements)){
                if(useOverlays){
                    setTimeout(function(){
                        if(stackedOptions === "Top"){
                            elTrans = elementsMargin * (items - 1);
                        } else if(stackedOptions === "Bottom" || stackedOptions === "None"){
                            elTrans = 0;
                        }

                        if(!isFirstTime){
                            // leftObj.classList.add('no-transition');
                        }

                        requestAnimationFrame(function(){
                            // leftObj.style.transform = "translateX(0) translateY(" + elTrans + "px) translateZ(0)";
                            // leftObj.style.opacity = '0';
                        });

                    },300);

                    isFirstTime = false;
                }
            }
        };

        //Move the overlay right to initial position.
        function resetOverlayRight() {
            if (!(currentPosition >= maxElements)){
                if(useOverlays){
                    setTimeout(function(){

                        if(stackedOptions === "Top") {

                            elTrans = elementsMargin * (items - 1);

                        } else if (stackedOptions === "Bottom" || stackedOptions === "None"){

                            elTrans = 0;

                        }

                        if(!isFirstTime){
                            rightObj.classList.add('no-transition');
                        }

                        requestAnimationFrame(function(){

                            rightObj.style.transform = "translateX(0) translateY(" + elTrans + "px) translateZ(0)";
                            rightObj.style.opacity = '0';
                        });

                    },300);

                    isFirstTime = false;
                }
            }
        };

        //Move the overlays to initial position.
        function resetOverlays() {
            if(!(currentPosition >= maxElements)){
                if(useOverlays){

                    setTimeout(function(){
                        if(stackedOptions === "Top"){

                            elTrans = elementsMargin * (items - 1);

                        } else if(stackedOptions === "Bottom" || stackedOptions === "None"){

                            elTrans = 0;

                        }

                        if(!isFirstTime){
                            rightObj.classList.add('no-transition');
                        }

                        requestAnimationFrame(function(){
                            rightObj.style.transform = "translateX(0) translateY(" + elTrans + "px) translateZ(0)";
                            rightObj.style.opacity = '0';
                        });

                    },300);	// wait for animations time

                    isFirstTime = false;
                }
            }
        };

        function setActiveHidden() {
            if(!(currentPosition >= maxElements)){
                listElNodesObj[currentPosition - 1].classList.remove('stackedcards-active');
                listElNodesObj[currentPosition - 1].classList.add('stackedcards-hidden');
                listElNodesObj[currentPosition].classList.add('stackedcards-active');
            }
        };

        //Set the new z-index for specific card.
        function setZindex(zIndex) {
            if(listElNodesObj[currentPosition]){
                listElNodesObj[currentPosition].style.zIndex = zIndex;
            }
        };

        // Remove element from the DOM after swipe. To use this method you need to call this function in onSwipeLeft, onSwipeRight and onSwipeTop and put the method just above the variable 'currentPosition = currentPosition + 1'.
        //On the actions onSwipeLeft, onSwipeRight and onSwipeTop you need to remove the currentPosition variable (currentPosition = currentPosition + 1) and the function setActiveHidden

        //Add translate X and Y to active card for each frame.
        function transformUi(moveX,moveY,opacity,elementObj) {
            requestAnimationFrame(function(){
                var element = elementObj;

                // Function to generate rotate value
                function RotateRegulator(value) {
                    if(value/10 > 15) {
                        return 15;
                    }
                    else if(value/10 < -15) {
                        return -15;
                    }
                    return value/10;
                }

                if(rotate){
                    var rotateElement = RotateRegulator(moveX);
                } else {
                    rotateElement = 0;
                }

                if(stackedOptions === "Top"){
                    elTrans = elementsMargin * (items - 1);
                    if(element){
                        element.style.transform = "translateX(" + moveX + "px) translateY(" + (moveY + elTrans) + "px) translateZ(0) rotate(" + rotateElement + "deg)";
                        element.style.opacity = opacity;
                    }
                } else if(stackedOptions === "Bottom" || stackedOptions === "None"){

                    if(element){
                        element.style.transform = "translateX(" + moveX + "px) translateY(" + (moveY) + "px) translateZ(0) rotate(" + rotateElement + "deg)";
                        element.style.opacity = opacity;
                    }

                }
            });
        };

        //Action to update all elements on the DOM for each stacked card.
        function updateUi() {
            requestAnimationFrame(function(){
                elTrans = 0;
                var elZindex = 5;
                var elScale = 1;
                var elOpac = 1;
                var elTransTop = items;
                var elTransInc = elementsMargin;

                for(let i = currentPosition; i < (currentPosition + items); i++){
                    if(listElNodesObj[i]){
                        if(stackedOptions === "Top"){

                            listElNodesObj[i].classList.add('stackedcards-top', 'stackedcards--animatable', 'stackedcards-origin-top');

                            if(useOverlays){
                                rightObj.classList.add('stackedcards-origin-top');
                            }

                            elTrans = elTransInc * elTransTop;
                            elTransTop--;

                        } else if(stackedOptions === "Bottom"){
                            listElNodesObj[i].classList.add('stackedcards-bottom', 'stackedcards--animatable', 'stackedcards-origin-bottom');

                            if(useOverlays){
                                rightObj.classList.add('stackedcards-origin-bottom');
                            }

                            elTrans = elTrans + elTransInc;

                        } else if (stackedOptions === "None"){

                            listElNodesObj[i].classList.add('stackedcards-none', 'stackedcards--animatable');
                            elTrans = elTrans + elTransInc;

                        }

                        listElNodesObj[i].style.transform ='scale(' + elScale + ') translateX(0) translateY(' + (elTrans - elTransInc) + 'px) translateZ(0)';
                        listElNodesObj[i].style.opacity = elOpac;
                        listElNodesObj[i].style.zIndex = elZindex;

                        elScale = elScale - 0.04;
                        elOpac = elOpac - (1 / items);
                        elZindex--;
                    }
                }

            });

        };

        //Touch events block
        var element = obj;
        var startTime;
        var startX;
        var startY;
        var translateX;
        var translateY;
        var currentX;
        var currentY;
        var touchingElement = false;
        var timeTaken;
        var topOpacity;
        var rightOpacity;
        var leftOpacity;

        function setOverlayOpacity() {

            topOpacity = (((translateY + (elementHeight) / 2) / 100) * -1);
            rightOpacity = translateX / 100;
            leftOpacity = ((translateX / 100) * -1);


            if(topOpacity > 1) {
                topOpacity = 1;
            }

            if(rightOpacity > 1) {
                rightOpacity = 1;
            }

            if(leftOpacity > 1) {
                leftOpacity = 1;
            }
        }

        function gestureStart(evt) {
            startTime = new Date().getTime();

            startX = evt.changedTouches[0].clientX;
            startY = evt.changedTouches[0].clientY;

            currentX = startX;
            currentY = startY;

            setOverlayOpacity();

            touchingElement = true;
            if(!(currentPosition >= maxElements)){
                if(listElNodesObj[currentPosition]){
                    listElNodesObj[currentPosition].classList.add('no-transition');
                    setZindex(6);

                    if(useOverlays){
                        rightObj.classList.add('no-transition');
                    }

                    if((currentPosition + 1) < maxElements){
                        listElNodesObj[currentPosition + 1].style.opacity = '1';
                    }

                    elementHeight = listElNodesObj[currentPosition].offsetHeight / 3;
                }

            }

        };

        function gestureMove(evt) {
            currentX = evt.changedTouches[0].pageX;
            currentY = evt.changedTouches[0].pageY;

            translateX = currentX - startX;
            translateY = currentY - startY;

            setOverlayOpacity();

            if(!(currentPosition >= maxElements)){
                evt.preventDefault();
                transformUi(translateX, translateY, 1, currentElementObj);

                if(useOverlays){
                    if(translateX < 0){
                        transformUi(0, 0, 0, rightObj);

                    } else if(translateX > 0){
                        transformUi(translateX, translateY, rightOpacity, rightObj);
                    }

                    if(useOverlays){
                        rightObj.style.zIndex = 8;
                    }

                }

            }

        };

        function gestureEnd(evt) {

            if(!touchingElement){
                return;
            }

            translateX = currentX - startX;
            translateY = currentY - startY;

            timeTaken = new Date().getTime() - startTime;

            touchingElement = false;

            if(!(currentPosition >= maxElements)){
                if(translateY < (elementHeight * -1) && translateX > ((listElNodesWidth / 2) * -1) && translateX < (listElNodesWidth / 2)){  //is Top?

                    if(translateY < (elementHeight * -1) || (Math.abs(translateY) / timeTaken > velocity)){ // Did It Move To Top?
                        onSwipeTop();
                    } else {
                        backToMiddle();
                    }

                } else {

                    if(translateX < 0){
                        if(translateX < ((listElNodesWidth / 2) * -1) || (Math.abs(translateX) / timeTaken > velocity)){ // Did It Move To Left?
                            console.error('left');
                            checkAnswer('left', () => {
                                onSwipeLeft();
                            }, false)
                        } else {
                            backToMiddle();
                        }
                    } else if(translateX > 0) {

                        if (translateX > (listElNodesWidth / 2) && (Math.abs(translateX) / timeTaken > velocity)){ // Did It Move To Right?
                            console.error('right');
                            checkAnswer('right', () => {
                                onSwipeRight();
                            }, false);
                        } else {
                            backToMiddle();
                        }

                    }
                }
            }
        };

        element.addEventListener('touchstart', gestureStart, false);
        element.addEventListener('touchmove', gestureMove, false);
        element.addEventListener('touchend', gestureEnd, false);

        //Add listeners to call global action for swipe cards
        var buttonLeft = document.querySelector('.left-action');
        var buttonRight = document.querySelector('.right-action');

        buttonLeft.addEventListener('click', onActionLeft, false);
        buttonRight.addEventListener('click', onActionRight, false);

    }

    stackedCards();
});
