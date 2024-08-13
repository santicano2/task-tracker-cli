#!/usr/bin/env node

import chalk from "chalk";
import inquirer from "inquirer";
import gradient from "gradient-string";
import chalkAnimation from "chalk-animation";
import figlet from "figlet";
import { createSpinner } from "nanospinner";

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

await welcome();
