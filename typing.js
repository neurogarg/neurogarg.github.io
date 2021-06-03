const phrases = ["A Neuroscience Student",
                "A Computational Neuroscience Student",
                "A Data Science Student",
                "A Medical Student on Break"]

// let i 
j = 0
// var phrase = "A Medical Student on Break"
function typing() {
    phrase = phrases[j%4];
    j++
    i = 0
    function slow(){
        if(i < phrase.length){
            document.getElementById("word").innerHTML += phrase.charAt(i);
            i++;
            setTimeout(slow,100);
        }
        else{
            setTimeout(deleting, 1000)
        }
    }
    slow();
}

function deleting(){
    i = phrase.length;
    // var res = phrase.length;

    function fast(){
        if(i > -1){
            var res = phrase.slice(0, i);        
            document.getElementById("word").innerHTML = res;
            i--;
            setTimeout(fast, 100);
        }
        else{
            // document.getElementById("word").innerHTML = ""
            typing()
        }
    }
    fast();
}
// function deleting() {

//     for (i in phrases){
//         var character= i.split ("")
//         function eacWord(){
//         if  (i.length > 0)  {
//             i.pop();
//             document.getElementById("type").innerHTML += character;
//         } else {
//             typing();
//             return false
//         }
//     }
//     setTimeout(eacWord,1000);
//     i++
//     }
// }

typing();



// var i;
// const character = [];
// for (i = 0; i < phrase.length; i++) {
//   character[i] = phrase[i];
// }




// slow()

