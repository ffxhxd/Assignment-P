import { useState } from "react";
import {
  Editor,
  EditorState,
  Modifier,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";
import Title from "./Title";
import Button from "../Components/Button.jsx";

const MyEditor = () => {
  const [isTypingAfterSpecialChar, setIsTypingAfterSpecialChar] =
    useState(false);

  const [editorState, setEditorState] = useState(() => {
    // Load content from local storage on component mount
    const savedContent = localStorage.getItem("editorContent");
    return savedContent
      ? EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent)))
      : EditorState.createEmpty();
  });

  const handleSaveClick = () => {
    // Save content to local storage when Save button is clicked
    const contentState = editorState.getCurrentContent();
    const rawContentState = convertToRaw(contentState);
    localStorage.setItem("editorContent", JSON.stringify(rawContentState));
  };

  const onChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const handleBeforeInput = (char) => {
    const currentContent = editorState.getCurrentContent();
    const currentSelection = editorState.getSelection();
    const currentBlock = currentContent.getBlockForKey(
      currentSelection.getStartKey()
    );
    const startOffset = currentSelection.getStartOffset();

    const textBefore = currentBlock.getText().slice(0, startOffset);
    const lastWord = textBefore.split(" ").pop();

    if (lastWord === "**" && char === " ") {
      toggleCustomStyle("CUSTOM_COLOR");
      setIsTypingAfterSpecialChar(false);
      return "handled";
    } else if (lastWord === "*" && char === " ") {
      toggleCustomStyle("CUSTOM_WEIGHT");
      setIsTypingAfterSpecialChar(false);
      return "handled";
    } else if (lastWord === "#" && char === " ") {
      toggleCustomStyle("CUSTOM_HEADING");
      setIsTypingAfterSpecialChar(false);
      return "handled";
    } else if (lastWord === "***" && char === " ") {
      toggleCustomStyle("CUSTOM_DECORATION");
      setIsTypingAfterSpecialChar(false);
      return "handled";
    } else if (char === "~") {
      // If the pressed key is "~", remove custom styling for the last word
      removeCustomStyles();
      setIsTypingAfterSpecialChar(true);
      return "handled";
    } else if (isTypingAfterSpecialChar) {
      // If user has started typing after special char, revert to normal text
      setIsTypingAfterSpecialChar(false);
      removeCustomStyles();
    }

    return "not-handled";
  };

  const toggleCustomStyle = (style) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const startOffset = 0;
    const endOffset = selection.getStartOffset();

    const currentStyle = editorState.getCurrentInlineStyle();

    let newContentState;

    if (currentStyle.has(style)) {
      newContentState = Modifier.removeInlineStyle(
        contentState,
        selection.merge({ anchorOffset: startOffset, focusOffset: endOffset }),
        style
      );
    } else {
      newContentState = Modifier.applyInlineStyle(
        contentState,
        selection.merge({ anchorOffset: startOffset, focusOffset: endOffset }),
        style
      );
    }

    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "change-inline-style"
    );
    setEditorState(newEditorState);
  };

  const removeCustomStyles = () => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const startOffset = selection.getStartOffset();
    const currentBlock = contentState.getBlockForKey(selection.getStartKey());
    const textBefore = currentBlock.getText().slice(0, startOffset);
    const lastWordStart = textBefore.lastIndexOf(" ") + 1; // Find the start of the last word
    const lastWordEnd = startOffset; // The end offset is the current selection start offset

    const stylesToRemove = [
      "CUSTOM_COLOR",
      "CUSTOM_WEIGHT",
      "CUSTOM_HEADING",
      "CUSTOM_DECORATION",
    ];

    let newContentState = contentState;

    stylesToRemove.forEach((style) => {
      newContentState = Modifier.removeInlineStyle(
        newContentState,
        selection.merge({
          anchorOffset: lastWordStart,
          focusOffset: lastWordEnd,
        }),
        style
      );
    });

    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "change-inline-style"
    );

    setEditorState(EditorState.forceSelection(newEditorState, selection));
  };

  // Define a custom style map
  const styleMap = {
    CUSTOM_COLOR: {
      color: "red",
    },
    CUSTOM_DECORATION: {
      textDecoration: "underline",
    },
    CUSTOM_WEIGHT: {
      fontWeight: "800",
    },
    CUSTOM_HEADING: {
      fontSize: "2.125rem",
    },
  };

  return (
    <div>
      <div className="flex flex-col mt-8 ml-2 mr-2">
        <div className="flex items-center justify-between">
          <div />
          <Title name="Fahad" />
          <Button onClick={handleSaveClick}>Save</Button>
        </div>
        <div className="bg-gray-800 text-white p-6 mt-2 h-[81vh] rounded-sm">
          <Editor
            editorState={editorState}
            onChange={onChange}
            handleBeforeInput={handleBeforeInput}
            customStyleMap={styleMap}
            placeholder="Start Writing..."
          />
        </div>
      </div>
    </div>
  );
};

export default MyEditor;
