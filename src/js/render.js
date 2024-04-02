"use strict";

const fs = require("fs");
const path = require("node:path");

//todo === variables ===
const baseBorderColor = "#ecf0f1";
const errorBorderColor = "#e74c3c";
const lightBaseBorderColor = "#6db9d5";
const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

let students = [];
let studentsLowered = [];

const coursesContainer = document.getElementById("coursesContainer");
const newCourseContainer = document.getElementById("newCourseContainer");
const errorMessagesContainer = document.getElementById("errorMessagesContainer");
const addStudentBtn = document.getElementById("addStudentBtn");
let studentsContainer = document.getElementById("studentsContainer");
const courseNameInputField = document.getElementById("courseNameInputField");
const studentNameInputField = document.getElementById("studentNameInputField");
const activeCourseContainer = document.getElementById("activeCourseContainer");
const cancelBtn = document.getElementById("cancelBtn");
const submitBtn = document.getElementById("submitBtn");

//todo === base functions ===
const getJsonData = () => {
	const rawdata = fs.readFileSync(path.join(__dirname, "data", "courses.json"), "utf8");
	const data = JSON.parse(rawdata);

	return data;
};

const writeJsonData = (data) => {
	fs.writeFileSync(path.join(__dirname, "data", "courses.json"), JSON.stringify(data));
};

const createErrorMessage = (err) => {
	const p = document.createElement("p");
	p.innerText = err;
	setTimeout(() => {
		p.remove();
	}, 3500);
	errorMessagesContainer.prepend(p);
};

const getTime = () => {
	const _Date = new Date();
	const day = weekday[_Date.getDay()];
	const date = _Date.getDate();
	const month = _Date.getMonth() + 1;
	const year = _Date.getFullYear();
	const hour = _Date.getHours();
	const minute = _Date.getMinutes();
	const seconds = _Date.getSeconds();
	const milliseconds = _Date.getMilliseconds();

	return [day, date, month, year, hour, minute, seconds, milliseconds];
};

const sliceStringIfNeeded = (word, length) => {
	if (word.length > length) {
		word = word.slice(0, length - 3) + "...";
	}

	return word;
};

//todo === open Course ===
const openCourseOverlay = (courseName) => {
	const data = getJsonData();
	if (!data["courses"][courseName]) {
		window.alert(
			"Irgendwas ist schiefgelaufen. Bitte konsultieren Sie den entwickler und sagen Sie ihm folgendens: Course does not exist (CourseContainer)"
		);
		return;
	}

	coursesContainer.classList.replace("flex", "none");
	activeCourseContainer.classList.replace("none", "block");

	activeCourseContainer.querySelector("h1").innerText = sliceStringIfNeeded(courseName, 20);

	const studentsListNode = document.getElementById("studentsList");
	document.getElementById("closeBtn").addEventListener("click", (event) => {
		const newContainer = document.createElement("div");
		newContainer.id = "studentsList";
		studentsListNode.remove();
		activeCourseContainer.appendChild(newContainer);

		coursesContainer.classList.replace("none", "flex");
		activeCourseContainer.classList.replace("block", "none");
  });

  let clickCounter = 0;
  const deleteCourseBtn = document.getElementById("deleteCourseBtn");
  deleteCourseBtn.addEventListener("click", (event) => {
    clickCounter++;
    if (clickCounter <= 1) {
      deleteCourseBtn.style.color = "#f1c40f";
      return;
    } else if (clickCounter === 2) {
      deleteCourseBtn.style.color = "#e67e22";
      return;
    } else if (clickCounter === 3) {
      deleteCourseBtn.style.color = "#e74c3c";
      return;
    }

    // close menu
    const newContainer = document.createElement("div");
    newContainer.id = "studentsList";
    studentsListNode.remove();
    activeCourseContainer.appendChild(newContainer);

    coursesContainer.classList.replace("none", "flex");
    activeCourseContainer.classList.replace("block", "none");

    // delete course and load startpage
    const jsonData = getJsonData();
    delete jsonData["courses"][courseName];
    writeJsonData(jsonData);
    reloadStartpage(courseName);
  });

	const studentsList = data["courses"][courseName]["students"];
	for (const [key, value] of Object.entries(studentsList)) {
		const name = key;
		const points = value["points"];

		const studentNode = document.createElement("div");
		studentNode.classList.add("student");
		studentNode.value = name;

		const goodPointBtn = document.createElement("button");
		goodPointBtn.classList.add("goodPoint");
		goodPointBtn.innerHTML = "&plus;";

		const span = document.createElement("span");
		span.classList.add("points");
		span.innerText = points + "P  ";

		const p = document.createElement("p");
		p.classList.add("studentName");
		p.appendChild(span);
		p.innerHTML += sliceStringIfNeeded(name, 13);

		const badPointBtn = document.createElement("button");
		badPointBtn.classList.add("badPoint");
		badPointBtn.innerHTML = "&minus;";

		studentNode.appendChild(goodPointBtn);
		studentNode.appendChild(p);
		studentNode.appendChild(badPointBtn);

		studentsListNode.appendChild(studentNode);

		goodPointBtn.addEventListener("click", (event) => {
			data["courses"][courseName]["students"][name]["points"] += 1;

			const pointNode = event.target.parentNode.querySelector("span.points");
			pointNode.innerText = data["courses"][courseName]["students"][name]["points"] + "P  ";

			const [day, date, month, year, hour, minute, seconds, milliseconds] = getTime();

			data["courses"][courseName]["students"][name]["history"][`${day}, ${date}.${month}.${year}, ${hour}:${minute}:${seconds}:${milliseconds}`] = 1;

			writeJsonData(data);
		});

		badPointBtn.addEventListener("click", (event) => {
			data["courses"][courseName]["students"][name]["points"] -= 1;

			const pointNode = event.target.parentNode.querySelector("span.points");
			pointNode.innerText = data["courses"][courseName]["students"][name]["points"] + "P  ";

			const [day, date, month, year, hour, minute, seconds, milliseconds] = getTime();
			data["courses"][courseName]["students"][name]["history"][`${day}, ${date}.${month}.${year}, ${hour}:${minute}:${seconds}:${milliseconds}`] = -1;

			writeJsonData(data);
		});
	}
};

const createNewCourseNode = (name) => {
	const paragraph = document.createElement("p");
	paragraph.classList.add("courseName");
	paragraph.innerText = sliceStringIfNeeded(name, 15);

	const button = document.createElement("button");
	button.classList.add("courseBtn");

	const div = document.createElement("div");
	div.classList.add("course");
	div.value = name;

	button.addEventListener("click", (event) => {
		openCourseOverlay(name);
	});

	button.appendChild(paragraph);
	div.appendChild(button);
  coursesContainer.prepend(div);
};

//todo === Startpage ===
const loadStartpage = (newCourseName = "") => {
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

//todo === reload Startpage ===
const reloadStartpage = (deletedCourse) => {
  if (coursesContainer.classList.contains("none")) {
    coursesContainer.classList.replace("none", "flex");
    newCourseContainer.classList.replace("block", "none");
  }

  for (let course of coursesContainer.children) {
    if (course.value == deletedCourse) {
      course.remove();
    }
  }

  loadStartpage();
};

// if user clicks on "create new course"
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
	} else if (studentsLowered.indexOf(name.toLowerCase()) !== -1) {
		createErrorMessage("Ein Schüler mit dem Namen ist bereits im Kurs!");
		studentNameInputField.value = "";
		return;
	} else {
		studentNameInputField.style.borderColor = lightBaseBorderColor;
	}

	students.push(name);
	studentsLowered.push(name.toLowerCase());

	name = sliceStringIfNeeded(name, 14);

	const span = document.createElement("span");
	span.classList.add("studentName");
	span.innerText = name;

	const btn = document.createElement("button");
	btn.classList.add("deleteStudentBtn");
	btn.innerHTML = "&#x2716;";
	btn.addEventListener("click", (event) => {
		// delete student
		const studentName = event.target.parentElement.value;
		const index = students.indexOf(studentName);
		students.splice(index, 1);
		studentsLowered.splice(studentsLowered.indexOf(studentName.toLowerCase()), 1);
		event.target.parentElement.remove();
	});

	const item = document.createElement("div");
	item.appendChild(span);
	item.appendChild(btn);
	item.classList.add("item");
	item.value = name;

	studentsContainer.prepend(item);
	studentNameInputField.value = "";
	studentNameInputField.focus();
});

studentNameInputField.addEventListener("keypress", (event) => {
  studentNameInputField.classList.add("lightBaseBorder");
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
    cancelBtn.classList.replace("warningBorder", "baseBorder");
		coursesContainer.classList.replace("none", "flex");
		newCourseContainer.classList.replace("block", "none");

		students = [];
		for (let node of studentsContainer.children) {
			node.remove();
    }

    courseNameInputField.value = "";
	} else {
    cancelBtn.classList.replace("baseBorder", "warningBorder");
	}
});

//todo === submit course creation ===
let clickCount2 = 0;
submitBtn.addEventListener("click", (event) => {
  let courseName = courseNameInputField.value.trim();
	const data = getJsonData();

  if (courseName.length <= 0) {
    submitBtn.classList.replace("baseBorder", "warningBorder");
    return;
  }

	if (data["courses"][courseName]) {
		createErrorMessage("Ein Kurs mit dem Namen existiert bereits!");
		courseNameInputField.value = "";
		courseNameInputField.focus();
		return;
  }

  if (studentsContainer.children.length <= 0) {
    createErrorMessage("Bitte fügen Sie mindestens einen Schüler hinzu!");
    studentNameInputField.focus();
    return;
  }

	clickCount2++;
	if (clickCount2 < 2) {
    submitBtn.classList.replace("baseBorder", "warningBorder");
		return;
  }
  clickCount2 = 0;

	coursesContainer.classList.replace("none", "flex");
	newCourseContainer.classList.replace("block", "none");

  // delete all students (the container -> students)
  const newStudentsContainer = document.createElement("div");
  newStudentsContainer.id = "studentsContainer";
  studentsContainer.parentNode.insertBefore(newStudentsContainer, studentsContainer.nextSibling);
  studentsContainer.remove();
  studentsContainer = newStudentsContainer;

	// save course data in json file
	const [day, date, month, year, hour, minute, seconds, milliseconds] = getTime();
	data["courses"][courseName] = {
		created: {
			day: day,
			date: date,
			month: month,
			year: year,
			string: `${day}, ${date}.${month}.${year}, ${hour}:${minute}:${seconds}:${milliseconds}`,
		},
	};

	data["courses"][courseName]["students"] = {};
	students.sort();
	for (let student of students) {
		data["courses"][courseName]["students"][student] = {
			name: student,
			points: 0,
			history: {},
		};
	}

	writeJsonData(data);
  loadStartpage(courseName);
  courseNameInputField.value = "";
  submitBtn.classList.replace("warningBorder", "baseBorder");
});

courseNameInputField.addEventListener("keypress", (event) => {
  courseNameInputField.classList.add("lightBaseBorder");
});

// Made by Yasin Aydin
