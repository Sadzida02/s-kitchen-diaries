"use client";

import { useRef, useState } from "react";
import styles from "./RecipeSocial.module.css";

type Candidate = { id: string; name: string };

// A comment box where typing @ opens a short list of people to mention. The pick is stored by id, so two people
// with the same name can never be mixed up; the text only shows "@Name".
export default function CommentComposer({
  placeholder,
  submitLabel,
  cancelLabel,
  mentionHint,
  initialText = "",
  initialMentions = {},
  candidates,
  busy,
  rows = 3,
  fieldClass,
  onSubmit,
  onCancel,
}: {
  placeholder: string;
  submitLabel: string;
  cancelLabel?: string;
  mentionHint: string;
  initialText?: string;
  initialMentions?: Record<string, string>;
  candidates: Candidate[];
  busy: boolean;
  rows?: number;
  fieldClass?: string;
  onSubmit: (text: string, mentionIds: string[]) => Promise<boolean>;
  onCancel?: () => void;
}) {
  const [text, setText] = useState(initialText);
  const [picked, setPicked] = useState<Record<string, string>>(initialMentions);
  const [query, setQuery] = useState<string | null>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  // the text typed after the last @ before the cursor, if it still looks like the start of a name
  const readQuery = (value: string, cursor: number) => {
    const before = value.slice(0, cursor);
    const at = before.lastIndexOf("@");
    if (at < 0 || (at > 0 && !/\s/.test(before[at - 1]))) return null;
    const typed = before.slice(at + 1);
    return /^[^\s@]{0,24}(?: [^\s@]{0,24})?$/.test(typed) ? typed : null;
  };

  const options = query === null ? [] : candidates.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);

  const choose = (person: Candidate) => {
    const el = field.current;
    if (!el || query === null) return;
    const cursor = el.selectionStart;
    const start = text.slice(0, cursor).lastIndexOf("@");
    const next = `${text.slice(0, start)}@${person.name} ${text.slice(cursor)}`;
    setText(next);
    setPicked((current) => ({ ...current, [person.id]: person.name }));
    setQuery(null);
    const place = start + person.name.length + 2;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(place, place);
    });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const body = text.trim();
    if (!body) return;
    // only the people whose @Name is still in the text are mentioned
    const ids = Object.entries(picked)
      .filter(([, name]) => body.includes(`@${name}`))
      .map(([id]) => id);
    if (await onSubmit(body, ids)) {
      setText("");
      setPicked({});
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.composer}>
        <textarea
          ref={field}
          required
          maxLength={1000}
          rows={rows}
          value={text}
          className={fieldClass}
          onChange={(event) => {
            setText(event.target.value);
            setQuery(readQuery(event.target.value, event.target.selectionStart));
          }}
          onKeyUp={(event) => setQuery(readQuery(event.currentTarget.value, event.currentTarget.selectionStart))}
          onBlur={() => setTimeout(() => setQuery(null), 150)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        {options.length > 0 && (
          <ul className={styles.mentionList} role="listbox">
            {options.map((person) => (
              <li key={person.id}>
                <button type="button" role="option" aria-selected="false" onMouseDown={(event) => event.preventDefault()} onClick={() => choose(person)}>
                  <span className={styles.avatarSmall} aria-hidden="true">
                    {person.name.slice(0, 1).toUpperCase()}
                  </span>
                  {person.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className={styles.hint}>{mentionHint}</p>
      <div className={styles.formRow}>
        {onCancel && (
          <button type="button" className={styles.ghostButton} onClick={onCancel}>
            {cancelLabel}
          </button>
        )}
        <button type="submit" className={styles.button} disabled={busy}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
