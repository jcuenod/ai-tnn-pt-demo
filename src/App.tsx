import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

const removeAccents = (x: string) =>
  x.replace(/[\u0590-\u05AF\u05BD\u05C0]/g, "").replace(/[\u05C3־]/g, "");

const removeVowels = (x: string) =>
  x
    .replace(/[\u0590-\u05AF\u05BD\u05C0]/g, "")
    .replace(/[\u05C3־]/g, "") // Accents
    .replace(/[\u05B0-\u05BB]/g, "") // vowels
    .replace(/\u05BC/g, "") // dagesh
    .replace(/שׁ/g, "ש") // shin
    .replace(/שׂ/g, "ש") // sin
    .replace(/[\u05C1\u05C2]/g, ""); // sin/shin dot

import est1 from "./est1.json";
import est1Orig from "./est1_orig.json";
est1 as Record<string, string>;
est1Orig as Record<string, string>;

type Note = {
  ref: string;
  original: string;
  literal_rendering: string;
  explanation: string;
  exegetical_significance: number;
  literalness: number;
  target_words: string;
};
import notes from "./notes.json";
notes as Note[];

const textWithNoteSpans = (
  text: string,
  ref: string,
  currentNoteRef: string
) => {
  const n = notes.filter((n) => n.ref === ref);
  let newText = text;
  n.forEach((note, i) => {
    const targetWordsString = note.target_words || "DO_NOT_REPLACE_ANYTHING";
    const noteRef = `${note.ref}__${i}`;
    newText = newText.replace(
      targetWordsString,
      `<span class="note ${
        noteRef === currentNoteRef && "active"
      }" data-ref="${noteRef}">${note.target_words}</span>`
    );
  });
  return newText;
};

const originalTextWithHighlight = (ref: string, highlight: string) => {
  const originalText = est1Orig[ref as keyof typeof est1Orig];
  if (originalText.indexOf(highlight) > -1) {
    return originalText.replace(
      highlight,
      `<span class="bg-yellow-200">${highlight}</span>`
    );
  }

  const originalTextWithoutAccents = removeAccents(originalText);
  const highlightWithoutAccents = removeAccents(highlight);
  if (originalTextWithoutAccents.indexOf(highlightWithoutAccents) > -1) {
    return originalTextWithoutAccents.replace(
      highlightWithoutAccents,
      `<span class="bg-yellow-200">${highlight}</span>`
    );
  }

  const originalTextWithoutVowels = removeVowels(originalText);
  const highlightWithoutVowels = removeVowels(highlight);
  if (originalTextWithoutVowels.indexOf(highlightWithoutVowels) > -1) {
    return originalTextWithoutVowels.replace(
      highlightWithoutVowels,
      `<span class="bg-yellow-200">${highlight}</span>`
    );
  }

  console.log(originalTextWithoutVowels, highlightWithoutVowels);
  return originalText;
};

type BookDisplayProps = {
  onMouseEnter: React.Dispatch<React.SetStateAction<string>>;
  currentNoteRef: string;
};
const BookDisplay = ({ onMouseEnter, currentNoteRef }: BookDisplayProps) => {
  return Object.keys(est1).map((v) => {
    return (
      <span key={v} className="verse" onMouseEnter={() => onMouseEnter(v)}>
        <span className="text-blue-600 text-sm font-bold px-1 top-[-5px] relative">
          {v.split(":")[1]}
        </span>
        <span
          dangerouslySetInnerHTML={{
            __html: textWithNoteSpans(
              est1[v as keyof typeof est1],
              v,
              currentNoteRef
            ),
          }}
        ></span>
      </span>
    );
  });
};

const NoteDisplay = ({ noteRef }: { noteRef: string }) => {
  const [ref_, index] = noteRef!.split("__");
  const notesForRef = notes.filter((n) => n.ref === ref_);
  if (!notesForRef[parseInt(index)]) {
    return null;
  }
  const note = notesForRef[parseInt(index)];

  return (
    <div
      className="rounded-lg border-2 border-slate-700 bg-slate-100 overflow-y-auto relative"
      style={{ maxHeight: "calc(100vh - 94px)" }}
    >
      <div className="sticky top-0 absolute bg-slate-700 p-2 text-xl text-slate-200 font-bold text-center">
        Notes
      </div>
      <div className="bg-slate-300 text-slate-600 px-4 text-xs font-bold min-w-16 text-right">
        {note.ref.replace("EST", "Esther")}
      </div>
      <div className="p-4 mb-4 overflow-hidden">
        <div>
          <span className="mr-2 font-bold">Literal:</span>
          <span>{note.literal_rendering}</span>
        </div>
        <details>
          <summary className="font-bold">Hebrew</summary>
          <div
            dir="rtl"
            className="text-2xl bg-slate-50 p-2 rounded-lg"
            style={{ fontFamily: "SBL Biblit" }}
            dangerouslySetInnerHTML={{
              __html: originalTextWithHighlight(note.ref, note.original),
            }}
          />
        </details>
        <details>
          <summary className="font-bold">Explanation</summary>
          <div>{note.explanation}</div>
        </details>
      </div>
    </div>
  );
};

function App() {
  const [currentVerse, setCurrentVerse] = useState("EST 1:1");
  const [currentNoteRef, setCurrentNoteRef] = useState("");

  useEffect(() => {
    document.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).classList.contains("note")) {
        const ref = (e.target as HTMLElement).dataset.ref || "";
        setCurrentNoteRef(ref);
      }
    });
  }, []);

  return (
    <div className="pt-16">
      <div className="fixed left-0 top-0 right-0 bg-gray-700 p-2 mb-4 shadow-lg z-50">
        <h1 className="text-xl text-center text-blue-200">
          {currentVerse.replace("EST", "Esther")}
        </h1>
      </div>
      <div className="max-w-6xl mx-auto flex flex-row pb-16">
        <div className="max-w-3xl text-xl p-4">
          <BookDisplay
            currentNoteRef={currentNoteRef}
            onMouseEnter={setCurrentVerse}
          />
        </div>
        <div className="max-w-1/3 w-96 p-4 relative">
          <div className="sticky top-16 right-0 p-2">
            <NoteDisplay noteRef={currentNoteRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
