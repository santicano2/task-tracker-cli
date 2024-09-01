#!/usr/bin/env node

import chalk from "chalk";
import gradient from "gradient-string";
import chalkAnimation from "chalk-animation";
import figlet from "figlet";
import { createSpinner } from "nanospinner";
import inquirer from "inquirer";
import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";
import { dirname } from "path";

// Convertir __dirname para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// console.log(chalk.bgGreen("Hola mama"));

let userName;

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

async function welcome() {
  const rainbowTitle = chalkAnimation.rainbow(
    "Bienvenido a Task Tracker CLI \n"
  );

  await sleep();
  rainbowTitle.stop();

  console.log(`${chalk.bgBlue(
    "- Añade, actualiza o borrar tareas"
  )} \n${chalk.bgMagenta(
    "- Muestra tareas pendientes o completadas"
  )}\n${chalk.bgGreen(
    "- Marca una tarea como pendiente o una tarea como completada"
  )}
		`);
}

// Nombre del archivo JSON de tareas
const TASKS_FILE = path.join(__dirname, "tareas.json");

// Leer el archivo JSON de tareas
function loadTasks() {
  if (fs.existsSync(TASKS_FILE)) {
    const data = fs.readFileSync(TASKS_FILE);
    return JSON.parse(data);
  }
  return [];
}

// Guardar el archivo JSON de tareas
function saveTasks(tasks) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

// Obtener el siguiente ID de tarea disponible
function getNextId(tasks) {
  if (tasks.length === 0) {
    return 1;
  }

  const ids = tasks.map((task) => task.id);
  return Math.max(...ids) + 1;
}

// Crear una nueva tarea
function addTask(description) {
  const tasks = loadTasks();
  const newTask = {
    id: getNextId(tasks),
    description,
    status: "pendiente",
  };
  tasks.push(newTask);
  saveTasks(tasks);

  console.log("Tarea agregada: ", description);
}

// Actualizar una tarea existente
function updateTask(id, newDescription) {
  const tasks = loadTasks();
  const task = tasks.find((task) => task.id === parseInt(id));

  if (task) {
    task.description = newDescription;
    saveTasks(tasks);
    console.log("Tarea actualizada: ", newDescription);
  } else {
    console.log("Tarea no encontrada");
  }
}

// Eliminar tarea
function deleteTask(id) {
  let tasks = loadTasks();
  const initialLength = tasks.length;
  tasks = tasks.filter((task) => task.id !== parseInt(id));

  if (tasks.length < initialLength) {
    saveTasks(tasks);
    console.log("Tarea eliminada");
  } else {
    console.log("Tarea no encontrada");
  }
}

// Cambiar estado de una tarea
function changeStatus(id, status) {
  const tasks = loadTasks();
  const task = tasks.find((task) => task.id === parseInt(id));

  if (task) {
    task.status = status;
    saveTasks(tasks);
    console.log(`Tarea marcada como ${status}`);
  } else {
    console.log("Tarea no encontrada");
  }
}

// Listar todas las tareas con colores según su estado
function listTasks(filter = null) {
  const tasks = loadTasks();
  tasks.forEach((task) => {
    if (!filter || task.status === filter) {
      const colorFunc = getStatusColor(task.status);
      console.log(
        colorFunc(`[${task.status}] ${task.id}: ${task.description}`)
      );
    }
  });
}

// Obtener el color según el estado
function getStatusColor(status) {
  switch (status) {
    case "completada":
      return chalk.green;
    case "en progreso":
      return chalk.blue;
    case "pendiente":
      return chalk.yellow;
    default:
      return chalk.white;
  }
}

// Menú principal usando inquirer con submenús
function mainMenu() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "¿Qué deseas hacer?",
        choices: ["Gestionar tareas", "Listar tareas", "Salir"],
      },
    ])
    .then((answers) => {
      switch (answers.action) {
        case "Gestionar tareas":
          manageTasksMenu();
          break;
        case "Listar tareas":
          listTasksMenu();
          break;
        case "Salir":
          console.log("¡Hasta luego!");
          process.exit();
          break;
        default:
          console.log("Acción no reconocida.");
          mainMenu();
          break;
      }
    });
}

// Submenú para gestionar tareas con visualización de tareas y sus IDs
function manageTasksMenu() {
  listTasks(); // Mostrar todas las tareas con sus IDs y colores
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "¿Qué acción deseas realizar?",
        choices: [
          "Agregar tarea",
          "Actualizar tarea",
          "Eliminar tarea",
          "Marcar tarea como en progreso",
          "Marcar tarea como completada",
          "Volver al menú principal",
        ],
      },
    ])
    .then((answers) => {
      switch (answers.action) {
        case "Agregar tarea":
          inquirer
            .prompt([
              {
                type: "input",
                name: "description",
                message: "Ingresa la descripción de la tarea:",
              },
            ])
            .then((answer) => {
              addTask(answer.description);
              manageTasksMenu();
            });
          break;
        case "Actualizar tarea":
          listTasks(); // Mostrar las tareas nuevamente antes de solicitar el ID
          inquirer
            .prompt([
              {
                type: "input",
                name: "id",
                message: "Ingresa el ID de la tarea a actualizar:",
              },
              {
                type: "input",
                name: "description",
                message: "Ingresa la nueva descripción de la tarea:",
              },
            ])
            .then((answers) => {
              updateTask(answers.id, answers.description);
              manageTasksMenu();
            });
          break;
        case "Eliminar tarea":
          listTasks(); // Mostrar las tareas nuevamente antes de solicitar el ID
          inquirer
            .prompt([
              {
                type: "input",
                name: "id",
                message: "Ingresa el ID de la tarea a eliminar:",
              },
            ])
            .then((answer) => {
              deleteTask(answer.id);
              manageTasksMenu();
            });
          break;
        case "Marcar tarea como en progreso":
          listTasks(); // Mostrar las tareas nuevamente antes de solicitar el ID
          inquirer
            .prompt([
              {
                type: "input",
                name: "id",
                message: "Ingresa el ID de la tarea a marcar como en progreso:",
              },
            ])
            .then((answer) => {
              changeStatus(answer.id, "en progreso");
              manageTasksMenu();
            });
          break;
        case "Marcar tarea como completada":
          listTasks(); // Mostrar las tareas nuevamente antes de solicitar el ID
          inquirer
            .prompt([
              {
                type: "input",
                name: "id",
                message: "Ingresa el ID de la tarea a marcar como completada:",
              },
            ])
            .then((answer) => {
              changeStatus(answer.id, "completada");
              manageTasksMenu();
            });
          break;
        case "Volver al menú principal":
          mainMenu();
          break;
        default:
          console.log("Acción no reconocida.");
          manageTasksMenu();
          break;
      }
    });
}

// Submenú para listar tareas
function listTasksMenu() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "¿Qué lista deseas ver?",
        choices: [
          "Listar todas las tareas",
          "Listar tareas completadas",
          "Listar tareas pendientes",
          "Listar tareas en progreso",
          "Volver al menú principal",
        ],
      },
    ])
    .then((answers) => {
      switch (answers.action) {
        case "Listar todas las tareas":
          listTasks();
          listTasksMenu();
          break;
        case "Listar tareas completadas":
          listTasks("completada");
          listTasksMenu();
          break;
        case "Listar tareas pendientes":
          listTasks("pendiente");
          listTasksMenu();
          break;
        case "Listar tareas en progreso":
          listTasks("en progreso");
          listTasksMenu();
          break;
        case "Volver al menú principal":
          mainMenu();
          break;
        default:
          console.log("Acción no reconocida.");
          listTasksMenu();
          break;
      }
    });
}

// Iniciar el menú principal
await welcome();
mainMenu();
