"use strict";

const fs = require("fs");
const path = require("node:path");

//todo === variables ===
const baseBorderColor = "#ecf0f1";
const errorBorderColor = "#e74c3c";
const lightBaseBorderColor = "#6db9d5";

const students = [];

const coursesContainer = document.getElementById("coursesContainer");
const newCourseContainer = document.getElementById("newCourseContainer");
const errorMessagesContainer = document.getElementById(
  "errorMessagesContainer"
);
const addStudentBtn = document.getElementById("addStudentBtn");
const studentsContainer = document.getElementById("studentsContainer");
const courseNameInputField = document.getElementById("courseNameInputField");
const studentNameInputField = document.getElementById("studentNameInputField");
const cancelBtn = document.getElementById("cancelBtn");
const submitBtn = document.getElementById("submitBtn");


//todo === base functions ===
const getJsonData = () => {
  const rawdata = fs.readFileSync(
    path.join(__dirname, "data", "courses.json"),
    "utf8"
  );
  const data = JSON.parse(rawdata);

  return data;
};

const writeJsonData = (data) => {
  fs.writeFileSync(
    path.join(__dirname, "data", "courses.json"),
    JSON.stringify(data)
  );
};

const createErrorMessage = (err) => {
  const p = document.createElement("p");
  p.innerText = err;
  setTimeout(() => {
    p.remove();
  }, 3500);
  errorMessagesContainer.prepend(p);
};

const createNewCourseNode = (name) => {
  const paragraph = document.createElement("p");
  paragraph.classList.add("courseName");
  paragraph.innerText = name;

  const button = document.createElement("button");
  button.classList.add("courseBtn");

  const div = document.createElement("div");
  div.classList.add("course");
  div.value = name;

  button.appendChild(paragraph);
  div.appendChild(button);
  coursesContainer.prepend(div);
}

//todo === Startpage ===
const loadStartpage = (newCourseName="") => {
  if (coursesContainer.classList.contains("none")) {
    coursesContainer.classList.replace("none", "flex");
    newCourseContainer.classList.replace("block", "none");
  }

  const data = getJsonData();

  if (newCourseName != "") {
    createNewCourseNode(newCourseName);
    return;
  }

  for (let course in data["courses"]) {
    createNewCourseNode(course);
  }
};

loadStartpage();

const createCourseButton = document.getElementById("createCourseBtn");
createCourseButton.addEventListener("click", (event) => {
  coursesContainer.classList.replace("flex", "none");
  newCourseContainer.classList.replace("none", "block");
});

//todo === add Student ===
addStudentBtn.addEventListener("click", (event) => {
  let name = studentNameInputField.value;

  if (name.length <= 0) {
    studentNameInputField.style.borderColor = errorBorderColor;
    return;
  } else {
    studentNameInputField.style.borderColor = lightBaseBorderColor;
  }

  students.push(name);

  if (name.length > 15) {
    name = name.slice(0, 13) + "...";
  }

  const span = document.createElement("span");
  span.classList.add("studentName");
  span.innerText = name;

  const btn = document.createElement("button");
  btn.classList.add("deleteStudentBtn");
  btn.innerHTML = "&#x2716;";
  btn.addEventListener("click", (event) => {
    const studentName = event.target.parentElement.value;
    const index = students.indexOf(studentName);
    students.splice(index, 1);
    event.target.parentElement.remove();
  });

  const item = document.createElement("div");
  item.appendChild(span);
  item.appendChild(btn);
  item.classList.add("item");
  item.value = name;

  studentsContainer.prepend(item);
  studentNameInputField.value = "";
});

studentNameInputField.addEventListener("keypress", (event) => {
  studentNameInputField.style.borderColor = lightBaseBorderColor;
  if (event.key === "Enter") {
    addStudentBtn.click();
  }
});

//todo === cancel course creation ===
let clickCount1 = 0;
cancelBtn.addEventListener("click", (event) => {
  clickCount1++;
  if (clickCount1 >= 2) {
    clickCount1 = 0;

    cancelBtn.style.borderColor = baseBorderColor;
    coursesContainer.classList.replace("none", "flex");
    newCourseContainer.classList.replace("block", "none");

    students = [];
    courseName = "";
  } else {
    cancelBtn.classList.add("warningBorder");
  }
});

//todo === submit course creation ===
let clickCount2 = 0;
submitBtn.addEventListener("click", (event) => {
  let courseName = courseNameInputField.value;
  const data = getJsonData();

  if (data["courses"][courseName]) {
    createErrorMessage("Ein Kurs mit dem Namen existiert bereits!");
    courseNameInputField.value = "";
    return;
  }

  clickCount2++;
  if (clickCount2 < 2) {
    submitBtn.classList.add("warningBorder");
    return;
  }

  if (courseName.length <= 0) {
    courseNameInputField.classList.add("warningBorder");
    return;
  }

  coursesContainer.classList.replace("none", "flex");
  newCourseContainer.classList.replace("block", "none");

  // create course (button)
  // const paragraph = document.createElement("p");
  // paragraph.classList.add("courseName");
  // paragraph.innerText = courseName;

  // const button = document.createElement("button");
  // button.classList.add("courseBtn");

  // const div = document.createElement("div");
  // div.classList.add("course");
  // div.value = courseName;

  // button.appendChild(paragraph);
  // div.appendChild(button);
  // coursesContainer.prepend(div);

  // save course data in json file
  const weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const date = new Date();
  data["courses"][courseName] = {
    created: {
      day: weekday[date.getDay()],
      date: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      string: date.toString(),
    },
  };

  data["courses"][courseName]["students"] = {};
  for (let student of students) {
    data["courses"][courseName]["students"][student] = {
      name: student,
      points: 0,
      history: {},
    };
  }

  writeJsonData(data);
  loadStartpage(courseName);
});

courseNameInputField.addEventListener("keypress", (event) => {
  courseNameInputField.classList.add("lightBaseBorder");
});
