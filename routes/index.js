var express = require("express");
var Task = require("../model/Tasks");
var TaskSchema = require("../validators/TaskValidator");
const Joi = require("joi");
var router = express.Router();

function getPriorityColor(priority) {
  const priorityClass = {
    Baixa: "btn btn-success btn-sm",
    Média: "btn btn-warning  btn-sm",
    Alta: "btn btn-danger  btn-sm",
  };
  return priorityClass[priority] || "defaultColor";
}

/* GET home page. */
router.get("/", function (req, res, next) {
  if (Task.list().length == 0) {
    Task.new("Tarefa 1", "Baixa");
    Task.new("Tarefa 2", "Baixa");
  }

  let obj = Task.getElementById(req.query.tid);
  res.render("index", {
    tasks: Task.list().map((task) => ({
      ...task,
      priorityClass: getPriorityColor(task.priority),
    })),
    task: obj,
  });
});

router.get("/sorted", function (req, res, next) {
  const sortedTasks = Task.sortAlphabetically().map((task) => ({
    ...task,
    priorityClass: getPriorityColor(task.priority),
  }));
  res.render("sorted", { tasks: sortedTasks });
});

router.get("/count", function (req, res, next) {
  res.render("count", { number: Task.countTasks() });
});

router.post("/tarefas", function (req, res) {
  const { error, value } = TaskSchema.validate(req.body);
  if (error) {
    res.render("index", { tasks: Task.list(), erro: "Dados incompletos" });
    return;
  }

  const { id, nome, prioridade } = value;
  if (id === undefined) {
    //Inserir
    Task.new(nome, prioridade);
  } else {
    //Alterar
    Task.update(id, nome, prioridade);
  }

  res.redirect("/");
});

router.get("/tarefas/del/:id", function (req, res) {
  const { id } = req.params;
  const { error, value } = Joi.number().integer().greater(0).validate(id);

  if (error || !Task.delete(value)) {
    res.send("Falha ao excluir uma tarefa");
    return;
  }
  res.redirect("/");
});

module.exports = router;
