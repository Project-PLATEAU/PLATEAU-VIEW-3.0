// Customizable value like the condition color should be stored to local storage,
// but this should work only on published page to debug easily.
export const USE_LOCAL_STORAGE = () => !window.reearth?.scene?.inEditor;
