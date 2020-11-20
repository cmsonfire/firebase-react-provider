import React from "react";
import { firebase, useFirebaseApp } from "@cmsonfire/admin-provider";
import "firebase/storage";

const StorageStateContext = React.createContext();
const StorageDispatchContext = React.createContext();
const storageReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE":
      return {
        ...state,
        storage: action.storage || null,
      };
    default:
      throw new Error(
        `Unhandled action type: ${action.type} in storageReducer`
      );
  }
};
function getInitialState() {
  return { storage: null };
}

export const useStorage = () => {
  const context = React.useContext(StorageStateContext);
  if (context === undefined) {
    throw new Error(
      `Context for useStorage is missing.\nUse withing <StorageProvider name={name}>`
    );
  }
  return context.storage;
};

export const StorageProvider = ({ name, children }) => {
  const [app] = useFirebaseApp(name);
  const [state, updateContext] = React.useReducer(
    storageReducer,
    getInitialState()
  );
  React.useEffect(() => {
    if (!app || !firebase) return;
    const storage = firebase.storage(app);
    updateContext({
      type: "UPDATE",
      storage,
    });
  }, [app]);

  return (
    <StorageStateContext.Provider value={state}>
      <StorageDispatchContext.Provider value={updateContext}>
        {children}
      </StorageDispatchContext.Provider>
    </StorageStateContext.Provider>
  );
};
