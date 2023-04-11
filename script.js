const main = document.querySelector("main");

main.addEventListener("click", (e) => {
    // нас интересует только нажатие кнопки
    if (e.target.tagName === "BUTTON") {
      // получаем название кнопки из атрибута "data-name"
      const { name } = e.target.dataset;
      // если перед нами кнопка для добавления задачи в список
      if (name === "add-btn") {
        // определяем поле для ввода текста задачи
        const todoInput = main.querySelector('[data-name="todo-input"]');
        // если оно не является пустым
        if (todoInput.value.trim() !== "") {
          // получаем текст задачи
          const value = todoInput.value;
          // создаем шаблон задачи
          const template = `
          <li class="list-group-item" draggable="true" data-id="${Date.now()}">
            <p>${value}</p>
            <button class="btn btn-outline-danger btn-sm" data-name="remove-btn">X</button>
          </li>
          `;
          // находим список задач
          const todosList = main.querySelector('[data-name="todos-list"]');
          // добавляем в него шаблон задачи
          todosList.insertAdjacentHTML("beforeend", template);
          // очищаем поле для ввода текста задачи
          todoInput.value = "";
        }
      // если перед нами кнопка для удаления задачи
      } else if (name === "remove-btn") {
        // просто удаляем ее
        e.target.parentElement.remove();
      }
    }
  });

  main.addEventListener("dragenter", (e) => {
    // нас интересуют только колонки
    if (e.target.classList.contains("list-group")) {
      e.target.classList.add("drop");
    }
  });
  
  main.addEventListener("dragleave", (e) => {
    if (e.target.classList.contains("drop")) {
      e.target.classList.remove("drop");
    }
  });

  main.addEventListener("dragstart", (e) => {
    // нас интересует только задача
    if (e.target.classList.contains("list-group-item")) {
      // сохраняем идентификатор задачи в объекте "dataTransfer" в виде обычного текста;
      // dataTransfer также позволяет сохранять HTML - text/html,
      // но в данном случае нам это ни к чему
      e.dataTransfer.setData("text/plain", e.target.dataset.id);
    }
  });
  // создаем переменную для хранения "низлежащего" элемента
let elemBelow = "";

main.addEventListener("dragover", (e) => {
  // отключаем стандартное поведение браузера;
  // это необходимо сделать в любом случае
  e.preventDefault();

  // записываем в переменную целевой элемент;
  // валидацию сделаем позже
  elemBelow = e.target;
});

main.addEventListener("drop", (e) => {
    // находим перетаскиваемую задачу по идентификатору, записанному в dataTransfer
    const todo = main.querySelector(
      `[data-id="${e.dataTransfer.getData("text/plain")}"]`
    );
  
    // прекращаем выполнение кода, если задача и элемент - одно и тоже
    if (elemBelow === todo) {
      return;
    }
  
    // если элементом является параграф или кнопка, значит, нам нужен их родительский элемент
    if (elemBelow.tagName === "P" || elemBelow.tagName === "BUTTON") {
      elemBelow = elemBelow.parentElement;
    }
  
    // на всякий случай еще раз проверяем, что имеем дело с задачей
    if (elemBelow.classList.contains("list-group-item")) {
      // нам нужно понять, куда помещать перетаскиваемый элемент:
      // до или после низлежащего;
      // для этого необходимо определить центр низлежащего элемента
      // и положение курсора относительно этого центра (выше или ниже)
      // определяем центр
      const center =
        elemBelow.getBoundingClientRect().y +
        elemBelow.getBoundingClientRect().height / 2;
      // если курсор находится ниже центра
      // значит, перетаскиваемый элемент должен быть помещен под низлежащим
      // иначе, перед ним
      if (e.clientY > center) {
        if (elemBelow.nextElementSibling !== null) {
          elemBelow = elemBelow.nextElementSibling;
        } else {
          return;
        }
      }
  
      elemBelow.parentElement.insertBefore(todo, elemBelow);
      // рокировка элементов может происходить в разных колонках
      // необходимо убедиться, что задачи будут визуально идентичными
      todo.className = elemBelow.className;
    }
  
    // если целью является колонка
    if (e.target.classList.contains("list-group")) {
      // просто добавляем в нее перетаскиваемый элемент
      // это приведет к автоматическому удалению элемента из "родной" колонки
      e.target.append(todo);
  
      // удаляем индикатор зоны для "бросания"
      if (e.target.classList.contains("drop")) {
        e.target.classList.remove("drop");
      }
  
      // визуальное оформление задачи в зависимости от колонки, в которой она находится
      const { name } = e.target.dataset;
  
      if (name === "completed-list") {
        if (todo.classList.contains("in-progress")) {
          todo.classList.remove("in-progress");
        }
        todo.classList.add("completed");
      } else if (name === "in-progress-list") {
        if (todo.classList.contains("completed")) {
          todo.classList.remove("completed");
        }
        todo.classList.add("in-progress");
      } else {
        todo.className = "list-group-item";
      }
    }
  });