import { $, $make } from "./dom.ts";

interface Task {
  label: string;
  done: boolean;
}

const tasks: Task[] = [];

const createTaskForm = $<HTMLFormElement>(".createTask");

createTaskForm.addEventListener("submit", (event) => {
  if (!createTaskForm.reportValidity()) return;
  event.preventDefault();

  const inputElt = $<HTMLInputElement>(createTaskForm, "input[type=text]");
  tasks.push({ label: inputElt.value, done: false });
  inputElt.value = "";

  renderTasks();
});

function renderTasks() {
  const taskListElt = $(".taskList");
  taskListElt.innerHTML = "";

  for (const [i, task] of tasks.entries()) {
    const taskElt = $make("div", taskListElt);

    const checkboxElt = $make("input", taskElt, { type: "checkbox", checked: task.done, id: `task${i}` });
    const labelElt = $make("label", taskElt, { textContent: task.label, htmlFor: `task${i}` });

    checkboxElt.addEventListener("change", onTaskChecked);
  }
}

function onTaskChecked(event: Event) {
  const checkboxElt = (event.target as HTMLInputElement);
  const taskIndex = parseInt(checkboxElt.id.substring("task".length), 10);
  tasks[taskIndex].done = checkboxElt.checked;
}
