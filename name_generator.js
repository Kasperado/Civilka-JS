
/* Culture name creation
1.0 Country influenced:
> Names of the cultures are sometimes the same of the countries 
> For civs ending with -land it gets usually changed to -(?)ish (english, polish, scottish)
> Making it end with -ian is very common (Estonia - Estonian, Hungary - Hungarian)
2.0 Generated:
> Name of randomly generated culture can start with any letter really
> It is common that there is at least one vowel in every 2-3 letter block in name (Cad|do, Ga|mi|la|ra|ay, Bur|me|se)
> Ending alter by adding -n to vowels and -i to other
*/



let vowels = "aeiou";
let consonants = "bcdfghjklmnpqrstvwxyz";
let letters = [...vowels, ...consonants];
function getRandomLetter(string) {
  return string[floor(random(0, string.length - 1))];
}

function getRandomThreeBlock() {
  let block = "";
  for (let i = 0; i < 3; i++) {
    let letter;
    let useVowel = (floor(random(0, 4))) < (i * 0.25);
    if (useVowel) {
      letter = getRandomLetter(vowels);
    } else {
      letter = getRandomLetter(consonants);
    }
    // Add
    block += letter
  }
  return block;
}

let threeLetters = ["shi", "chu"];