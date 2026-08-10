/** Hand a question up to the global nav's search sheet — it opens with
    the question prefilled, and the resolver answers. The whole site's
    section headers speak through this. */
export function ask(question: string) {
  window.dispatchEvent(new CustomEvent("seamark:ask", { detail: question }));
}
