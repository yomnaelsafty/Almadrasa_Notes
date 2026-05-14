import { app } from "./elements.js";
import {
  addElement,
  notesElement,
  searchInput,
  mobSearchInput,
} from "./elements.js";

const saveData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const fetchData = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : false;
};
/**Adding Notes */
const addingNotes = (isPinned = false) => {
  const title = document.querySelector("#Title").value;
  const author = document.querySelector("#Author").value;
  const body = document.querySelector("#Note").value;
  const date = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const newNote = {
    id: Date.now(),
    title,
    author,
    body,
    pinned: isPinned,
    date,
  };

  const exsitingNotes = fetchData("notes") || [];
  exsitingNotes.push(newNote);
  saveData("notes", exsitingNotes);
  renderNotes();
};

/**__Delete__ */
const deleteNote = (id) => {
  const answer = confirm("Do you want to delete this note ?");
  if (answer === false) return;

  const notes = fetchData("notes") || [];
  const updatedNotes = notes.filter((note) => note.id !== id);
  saveData("notes", updatedNotes);
  renderNotes();
};

/**__Selected Note Rendring__ */
const noteRendring = (id) => {
  const notes = fetchData("notes") || [];
  const selectedNote = notes.find((note) => note.id == id);
  if (!selectedNote) return;

  const container = document.querySelector(".note_render");
  container.innerHTML = `
    <div class="selected_note">
      <h2 class="note_title">${selectedNote.title}</h2>
      <div class="date_auther">
        <p>${selectedNote.date}</p>
        <span>/</span>
        <p>By ${selectedNote.author}</p>
      </div>
      <p class="note_body" id="note_body">${selectedNote.body.replace(/\n/g, "<br>")}</p>
      <button class="add-btn" id="add-btn">+</button>
    </div>
  `;

  const addBtn = document.querySelector(".add-btn");
  const bodyEl = document.querySelector("#note_body");
  let isEditing = false;

  addBtn.addEventListener("click", () => {
    if (!isEditing) {
      isEditing = true;
      bodyEl.contentEditable = "true";
      setTimeout(() => {
        bodyEl.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(bodyEl);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }, 0);
      addBtn.textContent = "✓";
    } else {
      const newBody = bodyEl.innerText;
      const allNotes = fetchData("notes") || [];
      const updated = allNotes.map((n) =>
        n.id === selectedNote.id ? { ...n, body: newBody } : n,
      );
      saveData("notes", updated);
      noteRendring(id);
    }
  });
};

/**__list Rendring */
const renderList = (list) => {
  return list
    .map(
      (note) =>
        `
      <li class="list" data-id="${note.id}">
        <h3 class="list_title">${note.title}</h3>
        <p class="list_text">${note.body}</p>
        <div class="list_footer">
          <p class="list_text">${note.date}</p>
          <button class="delete_btn" data-id="${note.id}">Delete</button>
        </div>
      </li>
    `,
    )
    .join("");
};

/**delete&select__ */
const deleteSelect = () => {
  const btns = document.querySelectorAll(".delete_btn");
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      deleteNote(id);
    });
  });

  const listedNotes = document.querySelectorAll(".list");
  listedNotes.forEach((note) => {
    note.addEventListener("touchstart", () => {
      note.classList.add("touching");
    });

    note.addEventListener("click", () => {
      listedNotes.forEach((n) => n.classList.remove("active"));

      note.classList.add("active");

      const id = Number(note.dataset.id);

      document.querySelector(".sidebar").classList.remove("open");
      document.querySelector("#mob_logo")?.classList.remove("hide");
      document.querySelector(".header-search")?.classList.remove("hide");

      setTimeout(() => {
        document.querySelector(".notes-section").classList.add("mob_mood");

        noteRendring(id);

        note.classList.remove("touching");
      }, 120);
    });
  });
};

/**__Notes Listing__ */
const ListingNotes = () => {
  const notes = fetchData("notes") || [];
  const pinnedNotes = notes.filter((note) => note.pinned === true);
  const otherNotes = notes.filter((note) => note.pinned === false);

  document.querySelector("#pinned-notes").innerHTML = renderList(pinnedNotes);
  document.querySelector("#other-notes").innerHTML = renderList(otherNotes);
  deleteSelect();
};

/**__search__ */
const noteSearching = (e) => {
  const query = e.target.value.toLowerCase();
  const notes = fetchData("notes") || [];
  const filtered = notes.filter((note) =>
    note.title.toLowerCase().includes(query),
  );

  const pinnedFiltered = filtered.filter((note) => note.pinned === true);
  const otherFiltered = filtered.filter((note) => note.pinned === false);

  document.querySelector("#pinned-notes").innerHTML =
    renderList(pinnedFiltered);
  document.querySelector("#other-notes").innerHTML = renderList(otherFiltered);

  document.querySelectorAll(".list-label").forEach((label) => {
    if (query === "") {
      label.classList.remove("remove");
    } else {
      label.classList.add("remove");
    }
  });

  deleteSelect();
};

/**__toggle btn__ */
const toggleList = () => {
  const toggleBTN = document.querySelector(".toggle-btn");
  toggleBTN.addEventListener("click", () => {
    document.querySelector(".notes-section").classList.toggle("collapsed");
    toggleBTN.classList.toggle("move");

    toggleBTN.innerHTML = document
      .querySelector(".notes-section")
      .classList.contains("collapsed")
      ? "&#8250;"
      : "&#8249;";
  });
};

/**__ Mobile__ */
const toggleSearch = () => {
  const searchTool = document.querySelector(".header-search");
  const searchBox = document.querySelector(".search-wrapper__header");
  const header = document.querySelector(".header");

  header.classList.toggle("search");
  searchBox.classList.toggle("appear");
  searchTool.classList.toggle("close");
};

const mobileMoode = () => {
  const logo = document.querySelector("#mob_logo");
  const sideBar = document.querySelector(".sidebar");
  const burgerManu = document.querySelector(".burger-manu");
  const searchTool = document.querySelector(".header-search");

  burgerManu.addEventListener("click", () => {
    sideBar.classList.add("open");
    logo.classList.add("hide");
    searchTool.classList.add("hide");
    searchTool.removeEventListener("click", toggleSearch);
    searchTool.addEventListener("click", toggleSearch);
  });

  const sidebarClose = document.querySelector(".close-sidebar");
  sidebarClose.addEventListener("click", () => {
    sideBar.classList.remove("open");
    logo.classList.remove("hide");
    searchTool.classList.remove("hide");
  });

  searchTool.addEventListener("click", toggleSearch);
};

const blurSearch = () => {
  searchInput.addEventListener("blur", () => {
    document.querySelectorAll(".list-label").forEach((label) => {
      label.classList.remove("remove");
    });
    ListingNotes();
  });

  mobSearchInput.addEventListener("blur", () => {
    document.querySelectorAll(".list-label").forEach((label) => {
      label.classList.remove("remove");
    });
    ListingNotes();
  });
};

/*__Add Notes page__*/
export function renderAddNote() {
  app.innerHTML = `
  <form class="add_note" id="add_note_form">
    <h2 class="add_note_title">Add Note</h2>
    <label for="Title" class="user_data_label">Title*</label>
    <input type="text" id="Title" class="user_data_input" required />
    <label for="Author" class="user_data_label">Author*</label>
    <input type="text" id="Author" class="user_data_input" required />
    <label for="Note" class="user_data_label">Your Note*</label>
    <textarea id="Note" class="user_data_input" required></textarea>
    <div class="add_note_btns">
      <button type="button" class="add_btn">Add Note</button>
      <button type="button" class="pinned_btn"> pinned note</button>
    </div>
  </form>
`;

  const addBTN = document.querySelector(".add_btn");
  addBTN.addEventListener("click", () => {
    addingNotes(false);
  });

  const pinnedBTN = document.querySelector(".pinned_btn");
  pinnedBTN.addEventListener("click", () => {
    addingNotes(true);
  });

  addElement.classList.add("active");
  notesElement.classList.remove("active");
}

/*__Notes page__*/
export function renderNotes() {
  app.innerHTML = `
 <section class="notes-section">
          <div class="pinned-list">
            <p class="list-label">PINNED</p>
            <div id="pinned-notes"></div>
          </div>
          <div class="other-list">
            <p class="list-label">Notes</p>
            <div id="other-notes"></div>
          </div>
        </section>
        <button class="toggle-btn" id="toggle-btn">&#8249;</button>
        <div class="note_render">
          <div class="empty_note">
            <img
              class="notes_img"
              src="./images/Add notes-pana 1.png"
              alt="notes-img"
            />
            <h3>No note selected yet !</h3>
            <p>Please choose any note to view</p>
          </div>
        </div>
  `;
  toggleList();

  ListingNotes();

  searchInput.addEventListener("input", noteSearching);
  mobSearchInput.addEventListener("input", noteSearching);
  blurSearch();
  mobileMoode();

  addElement.classList.remove("active");
  notesElement.classList.add("active");
}
