export const SEED_QUIZZES = [
  { id:"q1", title:"World Geography", category:"Geography", author:"Admin", authorId:"u0", difficulty:"medium",
    description:"Test your knowledge of countries, capitals and landmarks.",
    questions:[
      {text:"What is the capital of Australia?",options:["Sydney","Melbourne","Canberra","Brisbane"],correct:2,hint:"It was chosen as a compromise between the two largest cities."},
      {text:"Which is the longest river in the world?",options:["Amazon","Yangtze","Mississippi","Nile"],correct:3,hint:"It flows through northeastern Africa."},
      {text:"What country has the most natural lakes?",options:["Russia","USA","Brazil","Canada"],correct:3,hint:"It's in North America."},
      {text:"Which desert is the largest in the world?",options:["Sahara","Gobi","Arctic","Arabian"],correct:2,hint:"It's actually a cold desert."},
    ], ratings:[], plays:14 },
  { id:"q2", title:"Science Fundamentals", category:"Science", author:"Admin", authorId:"u0", difficulty:"easy",
    description:"Basic science questions for curious minds.",
    questions:[
      {text:"What is H₂O commonly known as?",options:["Oxygen","Hydrogen","Water","Salt"],correct:2,hint:"You drink it every day."},
      {text:"How many bones are in the adult human body?",options:["196","206","216","226"],correct:1,hint:"It's between 200 and 210."},
      {text:"What force keeps planets in orbit?",options:["Magnetism","Friction","Gravity","Inertia"],correct:2,hint:"Same force that pulls apples from trees."},
    ], ratings:[{userId:"u0",score:5}], plays:22 },
  { id:"q3", title:"Pop Culture Trivia", category:"Entertainment", author:"Admin", authorId:"u0", difficulty:"hard",
    description:"Music, movies, TV — how tuned in are you?",
    questions:[
      {text:"Which band released the album 'Dark Side of the Moon'?",options:["Led Zeppelin","Pink Floyd","The Who","Rush"],correct:1,hint:"Named after a colour."},
      {text:"Who directed 'Inception' (2010)?",options:["Steven Spielberg","James Cameron","Christopher Nolan","Ridley Scott"],correct:2,hint:"Also directed The Dark Knight."},
      {text:"In Friends, what is Joey's favourite food?",options:["Pizza","Tacos","Sandwiches","Lasagna"],correct:3,hint:"He won't share it."},
    ], ratings:[{userId:"u0",score:4}], plays:9 },
];

export const SEED_USERS = [
  {id:"u0", name:"Admin", email:"admin@quiz.com", password:"admin",
   history:[], totalPoints:0, avatar:"🦁"},
];
