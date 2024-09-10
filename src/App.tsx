import { useEffect, useState } from "react";
import "./App.css";

// Feather Icon (MIT License)
const BookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-book-open"
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

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
  currentNoteRef: string,
  hoveredNoteRef: string
) => {
  const n = notes.filter((n) => n.ref === ref);
  let newText = text;
  n.forEach((note) => {
    const targetWordsString = note.target_words || "DO_NOT_REPLACE_ANYTHING";
    const noteRef = notes.indexOf(note).toString();
    // if targetWordsString occurs more than once in the text, skip it
    if (newText.split(targetWordsString).length > 2) {
      return;
    }
    newText = newText.replace(
      targetWordsString,
      `<span class="note ${
        (noteRef === currentNoteRef ? "active " : "") +
        (noteRef === hoveredNoteRef ? "hover " : "")
      }" data-note-index="${noteRef}">${note.target_words}</span>`
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
  hoveredNoteRef: string;
  currentNoteRef: string;
};
const BookDisplay = ({
  onMouseEnter,
  currentNoteRef,
  hoveredNoteRef,
}: BookDisplayProps) => {
  useEffect(() => {
    const activeNote = document.querySelector(".note.active");
    if (activeNote) {
      activeNote.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentNoteRef]);

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
              currentNoteRef,
              hoveredNoteRef
            ),
          }}
        ></span>
      </span>
    );
  });
};

type NoteEntryProps = {
  title: string;
  children: React.ReactNode;
};
const NoteEntry = ({ title, children }: NoteEntryProps) => {
  return (
    <div className="mb-6">
      <div className="text-slate-400 text-sm font-bold">{title}</div>
      <div className="text-slate-800 text-lg">{children}</div>
    </div>
  );
};

const NoteDisplay = ({
  currentNoteIndex,
  visible,
}: {
  currentNoteIndex: number;
  visible: boolean;
}) => {
  const note = notes[currentNoteIndex];
  if (!note) {
    return <div />;
  }

  return (
    <div className="p-4" style={{ display: visible ? "block" : "none" }}>
      <div className="bg-white shadow p-8">
        <NoteEntry title="Reference">
          {note.ref.replace("EST", "Esther")}
        </NoteEntry>
        <NoteEntry title="Literal Rendering">
          {note.literal_rendering}
        </NoteEntry>
        <NoteEntry title="Original">
          <div
            dir="rtl"
            className="text-slate-800 text-2xl bg-slate-100 p-4 rounded my-2"
            style={{ fontFamily: "SBL Biblit" }}
            dangerouslySetInnerHTML={{
              __html: originalTextWithHighlight(note.ref, note.original),
            }}
          />
        </NoteEntry>
        <NoteEntry title="Note Text">{note.explanation}</NoteEntry>
      </div>
    </div>
  );
};

type ListDisplayProps = {
  setHoveredNoteRef: React.Dispatch<React.SetStateAction<string>>;
  setCurrentVerse: React.Dispatch<React.SetStateAction<string>>;
  onClick: (newI: string) => void;
  reference: string;
  visible: boolean;
};
const ListDisplay = ({
  setHoveredNoteRef,
  onClick,
  reference,
  visible,
}: ListDisplayProps) => {
  // Display a list of notes with their references that will allow the user to click on them to view the note
  // hovering the note will highlight it in the book display
  useEffect(() => {
    // scroll into view the first note for the current reference
    console.log(reference);
    const listNote = document.querySelector(
      `[data-notelist-ref="${reference}"]`
    );
    console.log(listNote);
    if (listNote) {
      // nearest
      listNote.scrollIntoView({ behavior: "smooth" });
    }
  }, [reference]);

  return (
    <div
      className="p-4"
      style={{ overflowY: "scroll", display: visible ? "block" : "none" }}
      onMouseLeave={() => setHoveredNoteRef("-1")}
    >
      {notes.map((note, i) => (
        <div
          key={i}
          data-notelist-ref={note.ref}
          className="px-4 py-2 border-b border-slate-100 cursor-pointer bg-white shadow p-8 hover:bg-slate-100"
          style={{ scrollMarginTop: "60px" }}
          onClick={() => onClick(i.toString())}
          onMouseEnter={() => {
            console.log(i);
            setHoveredNoteRef(i.toString());
            // setCurrentVerse(note.ref.split("__")[0]);
          }}
        >
          <div className="text-slate-400 text-sm font-bold">
            {note.ref.replace("EST", "Esther")}
          </div>
          <div className="text-slate-800 text-lg">{note.target_words}</div>
        </div>
      ))}
    </div>
  );
};

type TabBarProps = {
  options: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
};
const TabBar = ({ options, activeTab, setActiveTab }: TabBarProps) => {
  return (
    <div className="sticky top-0 bg-slate-200 text-md font-bold text-center uppercase flex flex-row w-full">
      {options.map((option) => (
        <a
          className={
            "p-2 border-b-2 grow cursor-pointer " +
            (activeTab === option
              ? "border-orange-500 text-orange-500"
              : "border-slate-200 text-slate-700 hover:bg-slate-300 hover:border-slate-400")
          }
          onClick={() => setActiveTab(option)}
        >
          {option}
        </a>
      ))}
    </div>
  );
};

function App() {
  const [currentVerse, setCurrentVerse] = useState("EST 1:1");
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [hoveredNoteRef, setHoveredNoteRef] = useState("");
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    document.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).classList.contains("note")) {
        const ref = parseInt((e.target as HTMLElement).dataset.noteIndex || "-1");
        console.log(ref, e.target);
        setCurrentNoteIndex(ref);
        setShowList(false);
      }
    });
  }, []);

  return (
    <div className="bg-gray-50 overflow-hidden flex flex-col h-screen relative">
      <div className="bg-white p-2 shadow-sm z-50">
        <div className="max-w-6xl mx-auto flex flex-row items-center">
          <span className="text-4xl text-orange-500">
          <BookIcon />
          </span>
          <h1 className="ml-2 text-2xl text-gray-800 font-bold">
            AI Notes on Esther
          </h1>
        </div>
      </div>
      <div className="flex flex-row w-screen overflow-hidden">
        <div className="p-16 overflow-y-auto h-full grow">
          <div className="max-w-4xl mx-auto bg-white p-16 shadow-sm">
            <h1 className="text-xl text-gray-800 font-bold mb-4">
              {currentVerse.replace("EST", "Esther")}
            </h1>
            <div className="text-lg">
              <BookDisplay
                currentNoteRef={currentNoteIndex.toString()}
                hoveredNoteRef={hoveredNoteRef}
                onMouseEnter={setCurrentVerse}
              />
            </div>
          </div>
        </div>
        <div className="bg-slate-100 shadow shrink min-w-[300px] max-w-[300px] lg:max-w-[400px] xl:max-w-[450px] 2xl:max-w-[550px] overflow-y-auto flex flex-col">
          <TabBar
            options={["List", "Note"]}
            activeTab={showList ? "List" : "Note"}
            setActiveTab={(tab) => setShowList(tab === "List")}
          />
          <ListDisplay
            visible={showList}
            reference={currentVerse}
            setHoveredNoteRef={setHoveredNoteRef}
            setCurrentVerse={setCurrentVerse}
            onClick={(newI: string) => {
              setCurrentNoteIndex(parseInt(newI));
              setShowList(false);
              setHoveredNoteRef("-1");
            }}
          />
          <NoteDisplay
            visible={!showList}
            currentNoteIndex={currentNoteIndex}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
