/* 
funcionalidad acciones  
Gonzalez Luis C.I: 27.143.015
*/
var tipo = "";
let numbers = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
];
let consonantsLowercase = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "ñ",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "q",
  "y",
  "z",
];

let letras = consonantsLowercase;

let numeros = numbers;
let level1Labels = { y: "Y griega" };

let heroActions = [
  { cmd: "seedown" },
  { cmd: "show" },
  { cmd: "sleep", ms: 1000 },
  { cmd: "toy", y: 225 },
  { cmd: "tox", x: 500 },
  { cmd: "toy", y: 100 },
  { cmd: "seedown" },

  {
    cmd: "ask",
    msg: "Hola, mi nombre es Aventurito. A que deseas jugar a aprender hoy? a las letras o los números?",
    options: {
      números: function (npc) {
        npc.goto("números");
        npc.type = "números";
        tipo = "numeros";
      },
      letras: function (npc) {
        npc.goto("letras");
        npc.type = "letras";
        tipo = "letras";
      },
    },
  },
  {
    cmd: "gamechar",
    ref: "letras",
    options: letras,
    labels: level1Labels,
    msg: `Muy bien!, vamos a aprender las letras, que letra es esta?`,
  },
  {
    cmd: "gamechar",
    ref: "números",
    options: numbers,
    msg: `Muy bien!, vamos a aprender los números, que numero es este?`,
  },
  { cmd: "sleep", ref: "end_game" },
];
