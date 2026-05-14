import { renderAddNote, renderNotes } from "./utiles.js";
import { addElement, notesElement } from "./elements.js";

renderNotes();

addElement.addEventListener("click", renderAddNote);

notesElement.addEventListener("click", renderNotes);
