#!/usr/bin/env node

import chalk from "chalk";
import gradient from "gradient-string";
import chalkAnimation from "chalk-animation";
import figlet from "figlet";
import { createSpinner } from "nanospinner";
import inquirer from "inquirer";
import fs from "fs";
import path from "path";

console.log(chalk.bgGreen("Hola mama"));

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

// Listar todas las tareas
function listTasks(filter = null) {
  const tasks = loadTasks();
  tasks.forEach((task) => {
    if (!filter || task.status === filter) {
      console.log(`[${task.status}] ${task.id}: ${task.description}`);
    }
  });
}
